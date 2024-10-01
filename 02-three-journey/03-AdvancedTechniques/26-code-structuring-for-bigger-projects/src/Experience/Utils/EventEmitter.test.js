import EventEmitter from './EventEmitter';
import { jest } from '@jest/globals';

describe('class EventEmitter', () => {
  it('resolveNames()', () => {
    const eventEmitter = new EventEmitter();

    const name1 = 'hello-world';
    const result1 = eventEmitter.resolveNames(name1);
    expect(result1).toEqual(['helloworld']);

    const name2 = 'hello_world';
    const result2 = eventEmitter.resolveNames(name2);
    expect(result2).toEqual(['helloworld']);

    const name3 = 'hello/world';
    const result3 = eventEmitter.resolveNames(name3);
    expect(result3).toEqual(['hello', 'world']);

    const name4 = 'hello,world';
    const result4 = eventEmitter.resolveNames(name4);
    expect(result4).toEqual(['hello', 'world']);

    const name5 = 'hello.world';
    const result5 = eventEmitter.resolveNames(name5);
    expect(result5).toEqual(['hello.world']);
  });

  it('resolveName()', () => {
    const eventEmitter = new EventEmitter();

    const name1 = 'hello-world';
    const result1 = eventEmitter.resolveName(name1);
    expect(result1).toEqual({
      original: 'hello-world',
      value: 'hello-world',
      namespace: 'base',
    });

    const name2 = 'hello.world';
    const result2 = eventEmitter.resolveName(name2);
    expect(result2).toEqual({
      original: 'hello.world',
      value: 'hello',
      namespace: 'world',
    });

    const name3 = 'hello/world';
    const result3 = eventEmitter.resolveName(name3);
    expect(result3).toEqual({
      original: 'hello/world',
      value: 'hello/world',
      namespace: 'base',
    });
  });

  it('resolveName() with resolveNames()', () => {
    const eventEmitter = new EventEmitter();

    const name1 = 'hello/world';
    const result1 = eventEmitter.resolveNames(name1).map(name => {
      return eventEmitter.resolveName(name);
    });
    expect(result1).toEqual([
      {
        original: 'hello',
        value: 'hello',
        namespace: 'base',
      },
      {
        original: 'world',
        value: 'world',
        namespace: 'base',
      },
    ]);

    const name2 = 'hello.miles/world.chocobe';
    const result2 = eventEmitter.resolveNames(name2).map(name => {
      return eventEmitter.resolveName(name);
    });
    expect(result2).toEqual([
      {
        original: 'hello.miles',
        value: 'hello',
        namespace: 'miles',
      },
      {
        original: 'world.chocobe',
        value: 'world',
        namespace: 'chocobe',
      },
    ]);

    const name3 = 'hello.miles,world.chocobe';
    const result3 = eventEmitter.resolveNames(name3).map(name => {
      return eventEmitter.resolveName(name);
    });
    expect(result3).toEqual([
      {
        original: 'hello.miles',
        value: 'hello',
        namespace: 'miles',
      },
      {
        original: 'world.chocobe',
        value: 'world',
        namespace: 'chocobe',
      },
    ]);

    const name4 = 'hello.miles/world.chocobe,friday.deepnatural typescript.MS/HELLO_WORLD';
    const result4 = eventEmitter.resolveNames(name4).map(name => {
      return eventEmitter.resolveName(name);
    });
    expect(result4).toEqual([
      {
        original: 'hello.miles',
        value: 'hello',
        namespace: 'miles',
      },
      {
        original: 'world.chocobe',
        value: 'world',
        namespace: 'chocobe',
      },
      {
        original: 'friday.deepnatural',
        value: 'friday',
        namespace: 'deepnatural',
      },
      {
        original: 'typescript.MS',
        value: 'typescript',
        namespace: 'MS',
      },
      {
        original: 'HELLOWORLD',
        value: 'HELLOWORLD',
        namespace: 'base',
      },
    ]);

    const name5 = 'hello.miles world.';
    const result5 = eventEmitter.resolveNames(name5).map(name => {
      return eventEmitter.resolveName(name);
    });
    expect(result5).toEqual([
      {
        original: 'hello.miles',
        value: 'hello',
        namespace: 'miles',
      },
      {
        original: 'world.',
        value: 'world',
        namespace: 'base',
      },
    ]);
  });

  it('on()', () => {
    const eventEmitter1 = new EventEmitter();
    const mockFn1 = jest.fn();
    eventEmitter1.on('hello', mockFn1);
    expect(eventEmitter1.callbacks).toEqual({
      base: {
        hello: [
          mockFn1,
        ],
      },
    });

    const eventEmitter2 = new EventEmitter();
    const mockFn2 = jest.fn();
    eventEmitter2.on('hello.miles/world.chocobe', mockFn2);
    expect(eventEmitter2.callbacks).toEqual({
      miles: {
        hello: [
          mockFn2,
        ],
      },
      chocobe: {
        world: [
          mockFn2,
        ],
      },
      base: {},
    });

    const eventEmitter3 = new EventEmitter();
    const mockFn3 = jest.fn();
    eventEmitter3.on('hello world./chocobe.miles', mockFn3);
    expect(eventEmitter3.callbacks).toEqual({
      base: {
        hello: [
          mockFn3,
        ],
        world: [
          mockFn3,
        ],
      },
      miles: {
        chocobe: [
          mockFn3,
        ],
      },
    });
  });

  it('off()', () => {
    const names = 'hello world./chocobe.miles';

    const eventEmitter1 = new EventEmitter();
    const mockFn1 = jest.fn();
    eventEmitter1.on(names, mockFn1);
    expect(eventEmitter1.callbacks).toEqual({
      base: {
        hello: [
          mockFn1,
        ],
        world: [
          mockFn1,
        ],
      },
      miles: {
        chocobe: [
          mockFn1,
        ],
      },
    });
    eventEmitter1.off('hello');
    expect(eventEmitter1.callbacks).toEqual({
      base: {
        world: [
          mockFn1,
        ],
      },
      miles: {
        chocobe: [
          mockFn1,
        ],
      },
    });

    const eventEmitter2 = new EventEmitter();
    const mockFn2 = jest.fn();
    eventEmitter2.on(names, mockFn2);
    eventEmitter2.off('hello,world');
    expect(eventEmitter2.callbacks).toEqual({
      miles: {
        chocobe: [
          mockFn2,
        ],
      },
    });

    const eventEmitter3 = new EventEmitter();
    const mockFn3 = jest.fn();
    eventEmitter3.on(names, mockFn3);
    eventEmitter3.off('hello. world,chocobe.miles');
    expect(eventEmitter3.callbacks).toEqual({
      // 
    });

    const eventEmitter4 = new EventEmitter();
    const mockFn4 = jest.fn();
    eventEmitter4.on(names, mockFn4);
    eventEmitter4.off('hello world typescript');
    expect(eventEmitter4.callbacks).toEqual({
      miles: {
        chocobe: [
          mockFn4,
        ],
      },
    });
  });

  it('trigger()', () => {
    const eventEmitter1 = new EventEmitter();
    const mockFn1 = jest.fn(params => params);
    eventEmitter1.on('miles', mockFn1);

    eventEmitter1.trigger('miles');
    eventEmitter1.trigger('miles', 1, 'hello');

    expect(mockFn1.mock.calls).toHaveLength(2);

    const eventEmitter2 = new EventEmitter();
    const mockFn2 = jest.fn(params => params);
    eventEmitter2.on('hello.miles,world.miles', mockFn2);

    eventEmitter2.trigger('hello.miles', 'Chocobe', 3);
    eventEmitter2.trigger('world.miles', 'Kim', 7);

    expect(mockFn2.mock.calls).toHaveLength(2);

    const eventEmitter3 = new EventEmitter();
    const mockFn3 = jest.fn(params => params);
    const mockFn4 = jest.fn(params => params);
    const mockFn5 = jest.fn(params => params);
    eventEmitter3.on('miles', mockFn3);
    eventEmitter3.on('miles', mockFn4);
    eventEmitter3.on('miles', mockFn5);

    eventEmitter3.trigger('miles', 'Hello World');

    expect(mockFn3.mock.calls).toHaveLength(1);
    expect(mockFn4.mock.calls).toHaveLength(1);
    expect(mockFn5.mock.calls).toHaveLength(1);
  });
});
