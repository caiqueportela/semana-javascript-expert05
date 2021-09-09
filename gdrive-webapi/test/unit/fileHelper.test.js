import {describe, expect, jest, test,} from '@jest/globals';
import fs from 'fs';

import FileHelper from "../../src/fileHelper";

describe('#FileHelper test suite', () => {

  describe('#getFilesStatus', () => {
    test('it should return files statuses in correct format', async () => {
      const statMock = {
        dev: 46,
        mode: 33279,
        nlink: 1,
        uid: 1000,
        gid: 1000,
        rdev: 0,
        blksize: 512,
        ino: 27303072741095828,
        size: 5228,
        blocks: 16,
        atimeMs: 1631156924516.689,
        mtimeMs: 1631156912167.3892,
        ctimeMs: 1631156922928.2954,
        birthtimeMs: 0,
        atime: '2021-09-09T03:08:44.517Z',
        mtime: '2021-09-09T03:08:32.167Z',
        ctime: '2021-09-09T03:08:42.928Z',
        birthtime: '1970-01-01T00:00:00.000Z',
      };

      const mockUser = 'cportela';
      process.env.USER = mockUser;
      const filename = 'banana.jpg';

      jest.spyOn(fs.promises, fs.promises.readdir.name)
        .mockResolvedValue([filename]);

      jest.spyOn(fs.promises, fs.promises.stat.name)
        .mockResolvedValue(statMock);

      const result = await FileHelper.getFilesStatus('/tmp');

      const expectedResult = [
        {
          size: '5.23 kB',
          lastModified: statMock.birthtime,
          owner: mockUser,
          file: filename,
        },
      ];

      expect(fs.promises.stat).toHaveBeenCalledWith(`/tmp/${filename}`);
      expect(result).toMatchObject(expectedResult);
    });
  });
});