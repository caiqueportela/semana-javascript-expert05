import { beforeEach, describe, expect, jest, test } from '@jest/globals';
import { logger } from '../../src/logger.js';
import Routes from '../../src/routes.js';
import { UploadHandler } from '../../src/uploadHandler.js';
import TestUtil from '../_util/testUtil.js';

describe('#Routes test suite', () => {
	const request = TestUtil.generateReadableStream(['some file bytes']);
	const response = TestUtil.generateWritableStream(() => {
	});

	const defaultParams = {
		request: Object.assign(request, {
			headers: {
				'Content-Type': 'multipart/form-data',
			},
			method: '',
			body: {},
		}),
		response: Object.assign(response, {
			setHeader: jest.fn(),
			writeHead: jest.fn(),
			end: jest.fn(),
		}),
		values: () => Object.values(defaultParams),
	};

	beforeEach(() => {
		jest.spyOn(logger, 'info')
			.mockImplementation();
	});

	describe('#setSocketInstance', () => {
		test('setSocket should store io instance', () => {
			const routes = new Routes();
			const ioObj = {
				to: (id) => ioObj,
				emit: (event, message) => {
				},
			};

			routes.setSocketInstance(ioObj);

			expect(routes.io).toStrictEqual(ioObj);
		});
	});

	describe('#handler', () => {
		test('given an inexistent route it should choose default route', async () => {
			const routes = new Routes();
			const params = {
				...defaultParams,
			};

			params.request.method = 'inexistent';
			await routes.handler(...params.values());

			expect(params.response.end).toHaveBeenCalledWith('Ola mundoso');
		});

		test('it should set any request with CORD enabled', async () => {
			const routes = new Routes();
			const params = {
				...defaultParams,
			};

			params.request.method = 'inexistent';
			await routes.handler(...params.values());

			expect(params.response.setHeader)
				.toHaveBeenCalledWith('Access-Control-Allow-Origin', '*');
		});

		test('given method OPTIONS it should choose options route', async () => {
			const routes = new Routes();
			const params = {
				...defaultParams,
			};

			params.request.method = 'OPTIONS';
			await routes.handler(...params.values());

			expect(params.response.writeHead).toHaveBeenCalledWith(204);
			expect(params.response.end).toHaveBeenCalled();
		});

		test('given method GET it should choose options route', async () => {
			const routes = new Routes();
			const params = {
				...defaultParams,
			};

			params.request.method = 'GET';
			jest.spyOn(routes, routes.get.name).mockResolvedValue();

			await routes.handler(...params.values());

			expect(routes.get).toHaveBeenCalled();
		});

		test('given method POST it should choose options route', async () => {
			const routes = new Routes();
			const params = {
				...defaultParams,
			};

			params.request.method = 'POST';
			jest.spyOn(routes, routes.post.name).mockResolvedValue();

			await routes.handler(...params.values());

			expect(routes.post).toHaveBeenCalled();
		});
	});

	describe('#get', () => {
		test('given method GET it should list all files downloaded', async () => {
			const routes = new Routes();
			const params = {
				...defaultParams,
			};
			params.request.method = 'GET';

			const filesStatusesMock = [
				{
					size: '5.23 kB',
					lastModified: '1970-01-01T00:00:00.000Z',
					owner: 'cportela',
					file: 'banana.jpg',
				},
			];

			jest.spyOn(routes.fileHelper, routes.fileHelper.getFilesStatus.name)
				.mockResolvedValue(filesStatusesMock);

			await routes.handler(...params.values());

			expect(params.response.writeHead).toHaveBeenCalledWith(200);
			expect(params.response.end).toHaveBeenCalledWith(JSON.stringify(filesStatusesMock));
		});
	});

	describe('#post', () => {
		test('it should validate post route workflow', async () => {
			const routes = new Routes('/tmp');
			const options = {
				...defaultParams,
			};
			options.request.method = 'POST';
			options.request.url = '?socketId=01';

			jest.spyOn(UploadHandler.prototype, UploadHandler.prototype.registerEvents.name)
				.mockImplementation((headers, onFinish) => {
					const writable = TestUtil.generateWritableStream(() => {
					});
					writable.on('finish', onFinish);

					return writable;
				});

			await routes.handler(...options.values());

			expect(UploadHandler.prototype.registerEvents).toHaveBeenCalled();
			expect(options.response.writeHead).toHaveBeenCalledWith(200);

			const expectedResult = JSON.stringify({ result: 'Files uploaded with success!' });
			expect(options.response.end).toHaveBeenCalledWith(expectedResult);
		});
	});

});
