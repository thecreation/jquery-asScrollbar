'use strict';

import config        from '../../config';
import merge         from 'merge-stream';
import gulp          from 'gulp';
import browser       from 'browser-sync';
import notify        from 'gulp-notify';
import AssetsManager from 'assets-manager';
import argv          from 'argv';

function getPackage() {
  let args = argv.option([
    {
      name: 'package',
      type: 'string'
    }
  ]).run();

  if(args.options.package){
    return args.options.package;
  }
  return null;
}

/*
 * Checkout https://github.com/amazingSurge/assets-manager
 */
export function copy(options = config.assets, message = 'Assets task complete') {
  let pkgName = getPackage();
  const manager = new AssetsManager('manifest.json', options);

  if(pkgName) {
    return function (done) {
      manager.copyPackage(pkgName).then(()=>{
        done();
      });
    }
  }

  return function (done) {
    manager.copyPackages().then(()=>{
      done();
    });
  };
}

export function clean(options = config.assets, message = 'Assets task complete') {
    let pkgName = getPackage();
  const manager = new AssetsManager('manifest.json', options);

  if(pkgName) {
    return function (done) {
      manager.cleanPackage(pkgName).then(()=>{
        done();
      });
    }
  }

  return function (done) {
    manager.cleanPackages().then(()=>{
      done();
    });
  };
}
