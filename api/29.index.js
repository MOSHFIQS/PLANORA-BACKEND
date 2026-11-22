"use strict";
exports.id = 29;
exports.ids = [29];
exports.modules = {

/***/ 96029:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

// ESM COMPAT FLAG
__webpack_require__.r(__webpack_exports__);

// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  ReplContext: () => (/* binding */ ReplContext)
});

// EXTERNAL MODULE: ./node_modules/.pnpm/@nestjs+common@12.6.0_class_5de3bfad43d55e84c3f9932406e3470d/node_modules/@nestjs/common/index.js + 38 modules
var common = __webpack_require__(76332);
// EXTERNAL MODULE: ./node_modules/.pnpm/@nestjs+core@12.6.0_@nestjs_822e232728348661a93bdbcc7b5f83e8/node_modules/@nestjs/core/application-config.js
var application_config = __webpack_require__(2545);
// EXTERNAL MODULE: ./node_modules/.pnpm/@nestjs+core@12.6.0_@nestjs_822e232728348661a93bdbcc7b5f83e8/node_modules/@nestjs/core/injector/index.js + 1 modules
var injector = __webpack_require__(10527);
// EXTERNAL MODULE: ./node_modules/.pnpm/@nestjs+core@12.6.0_@nestjs_822e232728348661a93bdbcc7b5f83e8/node_modules/@nestjs/core/injector/internal-core-module/internal-core-module.js + 2 modules
var internal_core_module = __webpack_require__(52915);
// EXTERNAL MODULE: ./node_modules/.pnpm/iterare@1.2.1/node_modules/iterare/lib/index.js
var lib = __webpack_require__(45657);
// EXTERNAL MODULE: ./node_modules/.pnpm/@nestjs+common@12.6.0_class_5de3bfad43d55e84c3f9932406e3470d/node_modules/@nestjs/common/internal.js + 1 modules
var internal = __webpack_require__(77800);
;// CONCATENATED MODULE: ./node_modules/.pnpm/@nestjs+core@12.6.0_@nestjs_822e232728348661a93bdbcc7b5f83e8/node_modules/@nestjs/core/repl/repl-function.js

class ReplFunction {
    ctx;
    logger;
    constructor(ctx) {
        this.ctx = ctx;
        this.logger = ctx.logger;
    }
    /**
     * @returns A message displayed by calling `<fnName>.help`
     */
    makeHelpMessage() {
        const { description, name, signature } = this.fnDefinition;
        const fnSignatureWithName = `${name}${signature}`;
        return `${internal/* clc */.jm.yellow(description)}\n${internal/* clc */.jm.magentaBright('Interface:')} ${internal/* clc */.jm.bold(fnSignatureWithName)}\n`;
    }
}

;// CONCATENATED MODULE: ./node_modules/.pnpm/@nestjs+core@12.6.0_@nestjs_822e232728348661a93bdbcc7b5f83e8/node_modules/@nestjs/core/repl/native-functions/help-repl-fn.js



class HelpReplFn extends ReplFunction {
    fnDefinition = {
        name: 'help',
        signature: '() => void',
        description: 'Display all available REPL native functions.',
    };
    static buildHelpMessage = ({ name, description }) => internal/* clc */.jm.cyanBright(name) +
        (description ? ` ${internal/* clc */.jm.bold('-')} ${description}` : '');
    action() {
        const sortedNativeFunctions = (0,lib/* iterate */.nl)(this.ctx.nativeFunctions)
            .map(([, nativeFunction]) => nativeFunction.fnDefinition)
            .toArray()
            .sort((a, b) => (a.name < b.name ? -1 : 1));
        this.ctx.writeToStdout(`You can call ${internal/* clc */.jm.bold('.help')} on any function listed below (e.g.: ${internal/* clc */.jm.bold('help.help')}):\n\n` +
            sortedNativeFunctions.map(HelpReplFn.buildHelpMessage).join('\n') +
            // Without the following LF the last item won't be displayed
            '\n');
    }
}

;// CONCATENATED MODULE: ./node_modules/.pnpm/@nestjs+core@12.6.0_@nestjs_822e232728348661a93bdbcc7b5f83e8/node_modules/@nestjs/core/repl/native-functions/get-repl-fn.js

class GetReplFn extends ReplFunction {
    fnDefinition = {
        name: 'get',
        signature: '(token: InjectionToken) => any',
        description: 'Retrieves an instance of either injectable or controller, otherwise, throws exception.',
        aliases: ['$'],
    };
    action(token) {
        return this.ctx.app.get(token);
    }
}

;// CONCATENATED MODULE: ./node_modules/.pnpm/@nestjs+core@12.6.0_@nestjs_822e232728348661a93bdbcc7b5f83e8/node_modules/@nestjs/core/repl/native-functions/resolve-repl-fn.js

class ResolveReplFn extends ReplFunction {
    fnDefinition = {
        name: 'resolve',
        description: 'Resolves transient or request-scoped instance of either injectable or controller, otherwise, throws exception.',
        signature: '(token: InjectionToken, contextId: any) => Promise<any>',
    };
    action(token, contextId) {
        return this.ctx.app.resolve(token, contextId);
    }
}

;// CONCATENATED MODULE: ./node_modules/.pnpm/@nestjs+core@12.6.0_@nestjs_822e232728348661a93bdbcc7b5f83e8/node_modules/@nestjs/core/repl/native-functions/select-relp-fn.js

class SelectReplFn extends ReplFunction {
    fnDefinition = {
        name: 'select',
        description: 'Allows navigating through the modules tree, for example, to pull out a specific instance from the selected module.',
        signature: '(token: DynamicModule | ClassRef) => INestApplicationContext',
    };
    action(token) {
        return this.ctx.app.select(token);
    }
}

;// CONCATENATED MODULE: ./node_modules/.pnpm/@nestjs+core@12.6.0_@nestjs_822e232728348661a93bdbcc7b5f83e8/node_modules/@nestjs/core/repl/native-functions/debug-repl-fn.js


class DebugReplFn extends ReplFunction {
    fnDefinition = {
        name: 'debug',
        description: 'Print all registered modules as a list together with their controllers and providers.\nIf the argument is passed in, for example, "debug(MyModule)" then it will only print components of this specific module.',
        signature: '(moduleCls?: ClassRef | string) => void',
    };
    action(moduleCls) {
        this.ctx.writeToStdout('\n');
        if (moduleCls) {
            const token = typeof moduleCls === 'function' ? moduleCls.name : moduleCls;
            const moduleEntry = this.ctx.debugRegistry[token];
            if (!moduleEntry) {
                return this.logger.error(`"${token}" has not been found in the modules registry`);
            }
            this.printCtrlsAndProviders(token, moduleEntry);
        }
        else {
            for (const [moduleKey, entry] of Object.entries(this.ctx.debugRegistry)) {
                this.printCtrlsAndProviders(moduleKey, entry);
            }
        }
        this.ctx.writeToStdout('\n');
    }
    printCtrlsAndProviders(moduleName, moduleDebugEntry) {
        this.ctx.writeToStdout(`${internal/* clc */.jm.green(moduleName)}:\n`);
        this.printCollection('controllers', moduleDebugEntry['controllers']);
        this.printCollection('providers', moduleDebugEntry['providers']);
    }
    printCollection(title, collectionValue) {
        const collectionEntries = Object.keys(collectionValue);
        if (collectionEntries.length <= 0) {
            return;
        }
        this.ctx.writeToStdout(` ${internal/* clc */.jm.yellow(`- ${title}`)}:\n`);
        collectionEntries.forEach(provider => this.ctx.writeToStdout(`  ${internal/* clc */.jm.green('◻')} ${provider}\n`));
    }
}

// EXTERNAL MODULE: ./node_modules/.pnpm/@nestjs+core@12.6.0_@nestjs_822e232728348661a93bdbcc7b5f83e8/node_modules/@nestjs/core/metadata-scanner.js
var metadata_scanner = __webpack_require__(42452);
;// CONCATENATED MODULE: ./node_modules/.pnpm/@nestjs+core@12.6.0_@nestjs_822e232728348661a93bdbcc7b5f83e8/node_modules/@nestjs/core/repl/native-functions/methods-repl-fn.js



class MethodsReplFn extends ReplFunction {
    fnDefinition = {
        name: 'methods',
        description: 'Display all public methods available on a given provider or controller.',
        signature: '(token: ClassRef | string) => void',
    };
    metadataScanner = new metadata_scanner/* MetadataScanner */.C();
    action(token) {
        const proto = typeof token !== 'function'
            ? Object.getPrototypeOf(this.ctx.app.get(token))
            : token?.prototype;
        const methods = this.metadataScanner.getAllMethodNames(proto);
        this.ctx.writeToStdout('\n');
        this.ctx.writeToStdout(`${internal/* clc */.jm.green('Methods')}:\n`);
        methods.forEach(methodName => this.ctx.writeToStdout(` ${internal/* clc */.jm.yellow('◻')} ${methodName}\n`));
        this.ctx.writeToStdout('\n');
    }
}

;// CONCATENATED MODULE: ./node_modules/.pnpm/@nestjs+core@12.6.0_@nestjs_822e232728348661a93bdbcc7b5f83e8/node_modules/@nestjs/core/repl/native-functions/index.js







;// CONCATENATED MODULE: ./node_modules/.pnpm/@nestjs+core@12.6.0_@nestjs_822e232728348661a93bdbcc7b5f83e8/node_modules/@nestjs/core/repl/repl-context.js





class ReplContext {
    app;
    logger = new common.Logger(ReplContext.name);
    debugRegistry = {};
    globalScope = Object.create(null);
    nativeFunctions = new Map();
    container;
    constructor(app, nativeFunctionsClassRefs) {
        this.app = app;
        this.container = app.container; // Using `any` because `app.container` is not public.
        this.initializeContext();
        this.initializeNativeFunctions(nativeFunctionsClassRefs || []);
    }
    writeToStdout(text) {
        process.stdout.write(text);
    }
    initializeContext() {
        const modules = this.container.getModules();
        modules.forEach(moduleRef => {
            let moduleName = moduleRef.metatype.name;
            if (moduleName === internal_core_module/* InternalCoreModule */.v.name) {
                return;
            }
            if (this.globalScope[moduleName]) {
                moduleName += ` (${moduleRef.token})`;
            }
            this.introspectCollection(moduleRef, moduleName, 'providers');
            this.introspectCollection(moduleRef, moduleName, 'controllers');
            // For in REPL auto-complete functionality
            Object.defineProperty(this.globalScope, moduleName, {
                value: moduleRef.metatype,
                configurable: false,
                enumerable: true,
            });
        });
    }
    introspectCollection(moduleRef, moduleKey, collection) {
        const moduleDebugEntry = {};
        moduleRef[collection].forEach(({ token }) => {
            const stringifiedToken = this.stringifyToken(token);
            if (stringifiedToken === application_config/* ApplicationConfig */.j.name ||
                stringifiedToken === moduleRef.metatype.name) {
                return;
            }
            if (!this.globalScope[stringifiedToken]) {
                // For in REPL auto-complete functionality
                Object.defineProperty(this.globalScope, stringifiedToken, {
                    value: token,
                    configurable: false,
                    enumerable: true,
                });
            }
            if (stringifiedToken === injector/* ModuleRef */.UG.name) {
                return;
            }
            moduleDebugEntry[stringifiedToken] = token;
        });
        this.debugRegistry[moduleKey] = {
            ...this.debugRegistry?.[moduleKey],
            [collection]: moduleDebugEntry,
        };
    }
    stringifyToken(token) {
        return typeof token !== 'string'
            ? typeof token === 'function'
                ? token.name
                : token?.toString()
            : `"${token}"`;
    }
    addNativeFunction(NativeFunctionRef) {
        const nativeFunction = new NativeFunctionRef(this);
        const nativeFunctions = [nativeFunction];
        this.nativeFunctions.set(nativeFunction.fnDefinition.name, nativeFunction);
        nativeFunction.fnDefinition.aliases?.forEach(aliasName => {
            const aliasNativeFunction = Object.create(nativeFunction);
            aliasNativeFunction.fnDefinition = {
                name: aliasName,
                description: aliasNativeFunction.fnDefinition.description,
                signature: aliasNativeFunction.fnDefinition.signature,
            };
            this.nativeFunctions.set(aliasName, aliasNativeFunction);
            nativeFunctions.push(aliasNativeFunction);
        });
        return nativeFunctions;
    }
    registerFunctionIntoGlobalScope(nativeFunction) {
        // Bind the method to REPL's context:
        this.globalScope[nativeFunction.fnDefinition.name] =
            nativeFunction.action.bind(nativeFunction);
        // Load the help trigger as a `help` getter on each native function:
        const functionBoundRef = this.globalScope[nativeFunction.fnDefinition.name];
        Object.defineProperty(functionBoundRef, 'help', {
            enumerable: false,
            configurable: false,
            get: () => 
            // Dynamically builds the help message as will unlikely to be called
            // several times.
            this.writeToStdout(nativeFunction.makeHelpMessage()),
        });
    }
    initializeNativeFunctions(nativeFunctionsClassRefs) {
        const builtInFunctionsClassRefs = [
            HelpReplFn,
            GetReplFn,
            ResolveReplFn,
            SelectReplFn,
            DebugReplFn,
            MethodsReplFn,
        ];
        builtInFunctionsClassRefs
            .concat(nativeFunctionsClassRefs)
            .forEach(NativeFunction => {
            const nativeFunctions = this.addNativeFunction(NativeFunction);
            nativeFunctions.forEach(nativeFunction => {
                this.registerFunctionIntoGlobalScope(nativeFunction);
            });
        });
    }
}


/***/ })

};
;