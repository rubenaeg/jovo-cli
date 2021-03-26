import { join as joinPaths, resolve } from 'path';
import {
  Config,
  JovoCliPlugin,
  JovoCliPluginConfig,
  JovoCliPluginType,
  ProjectConfigObject,
} from '../src';

describe('new Config()', () => {
  test('should load the config', () => {
    const mockedGetContent: jest.SpyInstance = jest
      .spyOn(Config.prototype, 'getContent')
      .mockReturnThis();
    const mockedGet: jest.SpyInstance = jest
      .spyOn(Config.prototype, 'get')
      .mockReturnValue({ endpoint: 'test' });

    const config: Config = new Config('');

    expect(config['config']).toBeDefined();
    expect(config['config'].endpoint).toMatch('test');
    expect(config['stage']).toBeUndefined();

    mockedGetContent.mockRestore();
    mockedGet.mockRestore();
  });

  test('should load the stage from config if not provided', () => {
    const mockedGetContent: jest.SpyInstance = jest
      .spyOn(Config.prototype, 'getContent')
      .mockReturnValue({ defaultStage: 'dev' });
    const mockedGet: jest.SpyInstance = jest.spyOn(Config.prototype, 'get').mockReturnThis();

    const config: Config = new Config('');

    expect(config['stage']).toBeDefined();
    expect(config['stage']).toMatch('dev');

    mockedGetContent.mockRestore();
    mockedGet.mockRestore();
  });
});

describe('get()', () => {
  test('should return raw config, if stage is not defined', () => {
    const mockedGetContent: jest.SpyInstance = jest
      .spyOn(Config.prototype, 'getContent')
      .mockReturnValue({ endpoint: 'test' });
    const mockedGet: jest.SpyInstance = jest.spyOn(Config.prototype, 'get').mockReturnValueOnce({});

    const config: Config = new Config('');
    const configContent: ProjectConfigObject = config.get();

    expect(configContent).toBeDefined();
    expect(configContent).toHaveProperty('endpoint');
    expect(configContent.endpoint).toMatch('test');

    mockedGetContent.mockRestore();
    mockedGet.mockRestore();
  });

  test('should return raw config, if no config exists for the provided stage', () => {
    const mockedGetContent: jest.SpyInstance = jest
      .spyOn(Config.prototype, 'getContent')
      .mockReturnValue({ endpoint: 'test', stages: { prod: { endpoint: 'prod' } } });
    const mockedGet: jest.SpyInstance = jest.spyOn(Config.prototype, 'get').mockReturnValueOnce({});

    const config: Config = new Config('', 'dev');
    const configContent: ProjectConfigObject = config.get();

    expect(configContent).toBeDefined();
    expect(configContent).toHaveProperty('endpoint');
    expect(configContent.endpoint).toMatch('test');
    expect(configContent.stages).toBeDefined();

    mockedGetContent.mockRestore();
    mockedGet.mockRestore();
  });

  test('should merge and return the config for the provided stage', () => {
    const mockedGetContent: jest.SpyInstance = jest
      .spyOn(Config.prototype, 'getContent')
      .mockReturnValue({ endpoint: 'test', stages: { dev: { endpoint: 'dev' } } });
    const mockedGet: jest.SpyInstance = jest.spyOn(Config.prototype, 'get').mockReturnValueOnce({});

    const config: Config = new Config('', 'dev');
    const configContent: ProjectConfigObject = config.get();

    expect(configContent).toBeDefined();
    expect(configContent).toHaveProperty('endpoint');
    expect(configContent.endpoint).toMatch('dev');
    expect(configContent.stages).toBeUndefined();

    mockedGetContent.mockRestore();
    mockedGet.mockRestore();
  });

  test('should throw an error if a plugin is not an instance of JovoCliPlugin', () => {
    const mockedGetContent: jest.SpyInstance = jest
      .spyOn(Config.prototype, 'getContent')
      .mockReturnValue({
        endpoint: 'test',
        // @ts-ignore
        plugins: ['invalid'],
        stages: { dev: { endpoint: 'dev' } },
      });
    const mockedGet: jest.SpyInstance = jest.spyOn(Config.prototype, 'get').mockReturnValueOnce({});

    const config: Config = new Config('', 'dev');
    expect(config.get.bind(config)).toThrow('Plugin invalid is not an instance of JovoCliPlugin.');

    mockedGetContent.mockRestore();
    mockedGet.mockRestore();
  });

  test('should merge and return the config with merged plugins for the provided stage', () => {
    const mockedGetContent: jest.SpyInstance = jest
      .spyOn(Config.prototype, 'getContent')
      .mockReturnValue({
        plugins: [
          new (class CliPlugin extends JovoCliPlugin {
            type: JovoCliPluginType = 'command';
            id: string = 'cliPlugin';
            config: JovoCliPluginConfig = {
              files: {
                foo1: 'bar1',
              },
            };
          })(),
        ],
        stages: {
          dev: {
            plugins: [
              new (class CliPlugin extends JovoCliPlugin {
                type: JovoCliPluginType = 'command';
                id: string = 'stagedCliPlugin';
                config: JovoCliPluginConfig = {
                  files: {
                    foo2: 'bar2',
                  },
                };
              })(),
            ],
          },
        },
      });
    const mockedGet: jest.SpyInstance = jest.spyOn(Config.prototype, 'get').mockReturnValueOnce({});

    const config: Config = new Config('', 'dev');
    const configContent: ProjectConfigObject = config.get();

    expect(configContent).toBeDefined();
    expect(configContent.stages).toBeUndefined();
    expect(configContent).toHaveProperty('plugins');
    expect(configContent.plugins).toHaveLength(1);
    expect(configContent.plugins![0].id).toMatch('stagedCliPlugin');
    expect(configContent.plugins![0].config.files).toHaveProperty('foo1');
    expect(configContent.plugins![0].config.files.foo1).toMatch('bar1');
    expect(configContent.plugins![0].config.files).toHaveProperty('foo2');
    expect(configContent.plugins![0].config.files.foo2).toMatch('bar2');

    mockedGetContent.mockRestore();
    mockedGet.mockRestore();
  });
});

describe('getContent()', () => {
  test('should return raw config content', () => {
    const mockedGetContent: jest.SpyInstance = jest
      .spyOn(Config.prototype, 'getContent')
      .mockReturnValueOnce({});
    const mockedGet: jest.SpyInstance = jest.spyOn(Config.prototype, 'get').mockReturnThis();

    const config: Config = new Config(resolve(joinPaths('test', '__mocks__')));
    const configContent: ProjectConfigObject = config.getContent();

    expect(configContent).toBeDefined();
    expect(configContent).toHaveProperty('endpoint');
    expect(configContent.endpoint).toMatch('http://test.com');

    mockedGetContent.mockRestore();
    mockedGet.mockRestore();
  });

  test('should throw an error if config cannot be found', () => {
    const mockedGetContent: jest.SpyInstance = jest
      .spyOn(Config.prototype, 'getContent')
      .mockReturnValueOnce({});
    const mockedGet: jest.SpyInstance = jest.spyOn(Config.prototype, 'get').mockReturnThis();

    const config: Config = new Config(resolve(joinPaths('test', '__mocks__', 'invalid')));

    expect(config.getContent.bind(config)).toThrow('Could not load project configuration.');

    mockedGetContent.mockRestore();
    mockedGet.mockRestore();
  });
});

describe('getParameter()', () => {
  test('should return the correct parameter', () => {
    const mockedGetContent: jest.SpyInstance = jest
      .spyOn(Config.prototype, 'getContent')
      .mockReturnThis();
    const mockedGet: jest.SpyInstance = jest.spyOn(Config.prototype, 'get').mockReturnThis();

    const config: Config = new Config('');
    // @ts-ignore
    config['config'] = { endpoint: 'test' };
    expect(config.getParameter('endpoint')).toMatch('test');

    mockedGetContent.mockRestore();
    mockedGet.mockRestore();
  });

  test('should return undefined if the paramater does not exist', () => {
    const mockedGetContent: jest.SpyInstance = jest
      .spyOn(Config.prototype, 'getContent')
      .mockReturnThis();
    const mockedGet: jest.SpyInstance = jest.spyOn(Config.prototype, 'get').mockReturnThis();

    const config: Config = new Config('');
    // @ts-ignore
    config['config'] = { endpoint: 'test' };
    expect(config.getParameter('invalid')).toBeUndefined();

    mockedGetContent.mockRestore();
    mockedGet.mockRestore();
  });
});

describe('getPath()', () => {
  test('should return path to config file', () => {
    const mockedGetContent: jest.SpyInstance = jest
      .spyOn(Config.prototype, 'getContent')
      .mockReturnThis();
    const mockedGet: jest.SpyInstance = jest.spyOn(Config.prototype, 'get').mockReturnThis();

    const config: Config = new Config('test');
    expect(config.getPath()).toMatch('test/jovo.project.js');

    mockedGetContent.mockRestore();
    mockedGet.mockRestore();
  });
});

describe('Config.getFileName()', () => {
  test('should return file name', () => {
    expect(Config.getFileName()).toMatch('jovo.project.js');
  });
});