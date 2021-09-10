export default class ConnectionManager {

	constructor({ apiUrl }) {
		this.apiUrl = apiUrl;

		this.ioClient = io.connect(apiUrl, { withCredentials: false });
		this.socketId = '';
	}

	async currentFiles() {
		const files = await (await fetch(this.apiUrl)).json();

		return files;
	}

	configureEvents({ onProgress }) {
		this.ioClient.on('connect', this.onConnect.bind(this));
		this.ioClient.on('file-upload', onProgress);
	}

	onConnect() {
		console.log('connected!', this.ioClient.id);
		this.socketId = this.ioClient.id;
	}

	async uploadFile(file) {
		const formData = new FormData();
		formData.append('file', file);

		const response = await fetch(`${this.apiUrl}?socketId=${this.socketId}`, {
			method: 'POST',
			body: formData,
		});

		return response.json();
	}

}
