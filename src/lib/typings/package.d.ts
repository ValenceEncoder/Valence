/**
 * Basic typing for NPM package.json
 */



export interface INPMPackageStringHashMap {
    [key: string]: string;
}

export interface INPMPackageRepository {
    type: string;
    url: string;
}

export interface INPMPackage {
    name: string;
    version: string;
    description?: string;
    main: string;
    scripts: INPMPackageStringHashMap;
    repository?: INPMPackageRepository;
    author: string;
    license: string;
    homepage?: string;
    devDependencies: INPMPackageStringHashMap;
    dependencies: INPMPackageStringHashMap;
}
