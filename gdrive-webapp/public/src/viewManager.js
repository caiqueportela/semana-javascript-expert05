export default class ViewManager {

	constructor() {
		this.tbody = document.getElementById('tbody');
		this.newFileBtn = document.getElementById('newFileBtn');
		this.fileElem = document.getElementById('fileElem');
		this.progressModal = document.getElementById('progressModal');
		this.progressBar = document.getElementById('progressBar');
		this.output = document.getElementById('output');

		this.formatter = new Intl.DateTimeFormat('pt', {
			locale: 'pt-br',
			month: 'long',
			day: 'numeric',
			year: 'numeric',
			hour: '2-digit',
			minute: '2-digit',
		});

		this.modalInstance = {};
	}

	configureModal() {
		this.modalInstance = M.Modal.init(this.progressModal, {
			opacity: 0,
			dismissable: false,
			// Libera clicks na tela
			onOpenEnd() {
				this.$overlay[0].remove();
			},
		});
	}

	openModal() {
		this.modalInstance.open();
	}

	closeModal() {
		this.modalInstance.close();
	}

	updateStatus(size) {
		this.output.innerHTML = `Uploading in <b>${Math.floor(size)}%</b>`;
		this.progressBar.value = size;
	}

	configureFileBtnClick() {
		this.newFileBtn.onclick = () => this.fileElem.click();
	}

	configureOnFileChange(fn) {
		this.fileElem.onchange = (e) => {
			fn(e.target.files);
			this.fileElem.value = null;
		};
	}

	updateCurrentFiles(files) {
		const template = (item) => `
			<tr>
				<td>${this.makeIcon(item.file)} ${item.file}</td>
				<td>${item.owner}</td>
				<td>${this.formatter.format(new Date(item.lastModified))}</td>
				<td>${item.size}</td>
			</tr>
		`;

		this.tbody.innerHTML = files.map(template)
			.join('');
	}

	getIcon(fileName) {
		return fileName.match(/\.mp4|mkv/i)
			   ? 'movie'
			   : fileName.match(/\.jp|png/i)
				 ? 'image'
				 : 'content_copy';
	}

	makeIcon(fileName) {
		const icon = this.getIcon(fileName);
		const colors = {
			image: 'yellow600',
			movie: 'red600',
			file: '',
		};

		return `
			<i class="material-icons ${colors[icon]} left">${icon}</i>
		`;
	}

}
