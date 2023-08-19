/* Description: frida ios auto intercept script
 * Mode: S+A
 * Version: 1.0
 * Credit: https://github.com/nanpuhaha/frida-script
 * Author: Jangwon Seo @nanpuhaha <nanpuhaha@gmail.com>
 */

/* How to use:
 * frida -U -n AppName -l auto.js
 * frida -U -f app.package.name -l auto.js -o auto.js.log
 * frida -H 192.168.xxx.xxx:27042 -f app.package.name -l auto.js -o auto.js.log
 */

console.info("Script loading...");

/* FIXME: Add your classes and methods
 * classesWithoutBacktrace - Intercept all methods of all classes without backtrace
 * classesWithBacktrace - Intercept all methods of all classes with backtrace
 * methodsWithoutBacktrace - Intercept all methods without backtrace
 * methodsWithBacktrace - Intercept all methods with backtrace
 */
const classesWithoutBacktrace = [];
const classesWithBacktrace = [];
const methodsWithoutBacktrace = [];
const methodsWithBacktrace = [];

/* Colorize the output
 * References:
 *  - https://stackoverflow.com/questions/9781218/how-to-change-node-jss-console-font-color
 *  - https://misc.flogisoft.com/bash/tip_colors_and_formatting
 */

const reset = "\x1b[0m";
const bold = {
    start: "\x1b[1m",
    end: "\x1b[21m",
};
const dim = {
    start: "\x1b[2m",
    end: "\x1b[22m",
};
const underline = {
    start: "\x1b[4m",
    end: "\x1b[24m",
};
const blink = {
    start: "\x1b[5m",
    end: "\x1b[25m",
};
const reverse = {
    start: "\x1b[7m",
    end: "\x1b[27m",
};
const hidden = {
    start: "\x1b[8m",
    end: "\x1b[28m",
};
const fg = {
    default: "\x1b[39m",
    black: "\x1b[30m",
    red: "\x1b[31m",           // Looks Good
    green: "\x1b[32m",         // Looks Good
    yellow: "\x1b[33m",        // Looks Good
    blue: "\x1b[34m",
    magenta: "\x1b[35m",       // Looks Good
    cyan: "\x1b[36m",          // Looks Good
    light_gray: "\x1b[37m",    // Looks Good
    crimson: "\x1b[38m",
    dark_gray: "\x1b[90m",
    light_red: "\x1b[91m",     // Looks Great
    light_green: "\x1b[92m",   // Looks Great
    light_yellow: "\x1b[93m",  // Looks Great
    light_blue: "\x1b[94m",    // Looks Great
    light_magenta: "\x1b[95m", // Looks Great
    light_cyan: "\x1b[96m",    // Looks Great
    white: "\x1b[97m",         // Looks Great
};
const bg = {
    default: "\x1b[49m",
    black: "\x1b[40m",
    red: "\x1b[41m",
    green: "\x1b[42m",
    yellow: "\x1b[43m",
    blue: "\x1b[44m",
    magenta: "\x1b[45m",
    cyan: "\x1b[46m",
    light_gray: "\x1b[47m",
    crimson: "\x1b[48m",
    dark_gray: "\x1b[100m",
    light_red: "\x1b[101m",
    light_green: "\x1b[102m",
    light_yellow: "\x1b[103m",
    light_blue: "\x1b[104m",
    light_magenta: "\x1b[105m",
    light_cyan: "\x1b[106m",
    white: "\x1b[107m",
};

/**
* Print the "type"
* @param {*} desc
* @param {*} arg
* @param {bool} isObject
*/
function printType(desc, arg, isObject = true) {
    const color = fg.magenta;
    if (isObject) {
        try {
            // console.log(color, desc, bold.start, `${ObjC.Object(arg).$className}`, bold.end, reset);
            console.log(color, desc, bold.start, ObjC.Object(arg).$className, bold.end, reset);
        } catch (err) {
            console.log(`Error on printType()`);
            console.log(desc, arg, isObject);
            console.log(err);
        }
    }
}

/**
* Print the "value"
* @param {*} desc
* @param {*} arg
* @param {bool} isObject
*/
function printValue(desc, arg, isObject = true) {
    const color = fg.cyan;
    if (isObject) {
        try {
            console.log(color, desc, bold.start, ObjC.Object(arg), bold.end, reset);
        } catch (err) {
            console.log(`Error on printValue()`);
            console.log(desc, arg, isObject);
            console.log(err);
        }
    } else {
        console.log(color, desc, bold.start, arg, bold.end, reset);
    }
}

function printTypeValue(desc, arg, type) {
    /*
    void
    pointer
    int
    uint
    long
    ulong
    char
    uchar
    size_t
    ssize_t
    float
    double
    int8
    uint8
    int16
    uint16
    int32
    uint32
    int64
    uint64
    bool
    */
    let skipTypes = ['int', 'uint', 'long', 'ulong', 'char', 'uchar', 'size_t', 'ssize_t', 'float', 'double', 'int8', 'uint8', 'int16', 'uint16', 'int32', 'uint32', 'int64', 'uint64', 'bool']
    let typeDesc = ` - ${desc} type:\t`;
    let valueDesc = ` - ${desc} value:\t`;
    if (skipTypes.includes(type)) {
        printType(typeDesc, arg, false);
        printValue(valueDesc, arg, false);

    } else if (type == 'pointer') {
        printType(typeDesc, arg);
        printValue(valueDesc, arg);
    } else if (type == 'void') {
        printType(typeDesc, arg);
        printValue(valueDesc, arg);
    } else {
        console.warn(`[WARNING] You should check this type: ${type}`);
        printType(typeDesc, arg);
        printValue(valueDesc, arg);
    }

    // switch (type) {
    //     case 'int':
    //     case 'uint':
    //     case 'long':
    //     case 'ulong':
    //     case 'char':
    //     case 'uchar':
    //     case 'size_t':
    //     case 'ssize_t':
    //     case 'float':
    //     case 'double':
    //     case 'int8':
    //     case 'uint8':
    //     case 'int16':
    //     case 'uint16':
    //     case 'int32':
    //     case 'uint32':
    //     case 'int64':
    //     case 'uint64':
    //     case 'bool':
    //         printType(desc, arg, object = false);
    //         printValue(desc, arg, object = false);
    //         break;
    //     case 'pointer':
    //     default:
    //         console.warn(`[WARNING] You should check this type: ${type}`);
    //         printType(desc, arg);
    //         printValue(desc, arg);
    // }
}

/**
* Parse a method
* @param {string} method
* @returns {Array} [prefix, selector, argCount]
* @example
* // return ['-', 'copyWithZone:', 1]
* parseShortMethod('- copyWithZone:')
*/
function parseShortMethod(method) {
    let [prefix, selector] = method.split(' ');
    let argCount = (selector.match(/:/g) || []).length;
    return [prefix, selector, argCount];
}

/**
* Parse a method
* @param {string} method
* @returns {Array} [className, prefix, selector, argCount]
* @example
* // return ['ViewController', '-', 'viewDidLoad', 0]
* parseMethod('-[ViewController viewDidLoad]')
* @example
* // return ['NSString', '-', 'initWithUTF8String:', 1]
* parseMethod('-[NSString initWithUTF8String:]')
*/
function parseFullMethod(method) {
    let className = method.match(/^[-+]\[(.*)\s/)[1];
    let prefix = method.match(/^([-+])/)[1];
    let selector = method.match(/^[-+]\[.*\s(.*)\]/)[1];
    let argCount = (selector.match(/:/g) || []).length;
    return [className, prefix, selector, argCount];
}

/**
* Make a method
* @param {string} className - target class name
* @param {string} prefix - method prefix
* @param {string} selector - method selector
* @returns {string} full method
*/
function makeFullMethod(className, prefix, selector) {
    return `${prefix}[${className} ${selector}]`;
}


function getBacktrace(thisContext) {
    let backtrace = Thread.backtrace(thisContext.context, Backtracer.ACCURATE).map(DebugSymbol.fromAddress).join("\n\t");
    return backtrace;
}


/**
* Intercept all methods of all classes
* @param {Array} classes
* @param {boolean} backtrace - print backtrace
* @example
* autoInterceptClasses(['ViewController', 'AppDelegate'])
*/
function autoInterceptClasses(classes, backtrace = false) {
    for (let one_class of classes) {
        autoInterceptClass(one_class, backtrace);
    }
}

/**
* Intercept all methods of a class
* @param {string} className - target class name
* @param {boolean} backtrace - print backtrace
* @example
* autoInterceptClass('ViewController')
* @example
* autoInterceptClass('ViewController', true)
*/
function autoInterceptClass(className, backtrace = false) {
    const ownMethods = ObjC.classes[className].$ownMethods;
    const skipMethods = ['- copy', '- copyWithZone:', '+ alloc', '- dealloc', '+ allocWithZone:', '- release', '- class', '- .cxx_destruct', '- .cxx_construct'];
    for (let ownMethod of ownMethods) {
        if (skipMethods.includes(ownMethod)) {
            continue;
        }
        console.info(`[info] trying to intercept class: ${className}, method: ${ownMethod}`);
        let [prefix, selector] = parseShortMethod(ownMethod);
        let method = makeFullMethod(className, prefix, selector);
        autoInterceptMethod(method, backtrace);
    }
}


function autoInterceptMethods(methods, backtrace = false) {
    for (let method of methods) {
        autoInterceptMethod(method, backtrace);
    }
}

/**
* Intercept a method
* @param {string} method - target method
* @param {boolean} backtrace - print backtrace
*/
function autoInterceptMethod(method, backtrace = false) {
    try {
        const [className, prefix, selector, argCount] = parseFullMethod(method);

        console.info("[info] trying to intercept method:", target);
        const oldImpl = ObjC.classes[className][prefix + " " + selector];

        const skipClasses = ['NSObject', 'NSProxy', 'Object', '_TtCs12_SwiftObject'];
        const skipMethods = ['- copyWithZone:', '+ alloc', '- dealloc', '+ allocWithZone:', '- release', '- class', '- .cxx_destruct', '- .cxx_construct']

        let skip = false;
        for (let skipMethod of skipMethods) {
            if (method.includes(skipMethod)) {
                skip = True;
                break;
            }
        }

        if (!skip) {
            Interceptor.attach(oldImpl.implementation, {
                onEnter: function (args) {
                    console.log('\n\n');
                    console.log(fg.green, `🟢 >>>>> ${method} >>>>>`, reset);

                    if (backtrace) {
                        let backtrace = getBacktrace(this);
                        // let backtrace = Thread.backtrace(this.context, Backtracer.ACCURATE).map(DebugSymbol.fromAddress).join("\n\t");
                        console.debug(`[-] ======== Backtrace Start : ${method} ========`);
                        console.debug(backtrace);
                        console.debug(`[-] ======== Backtrace End : ${method} ========`);
                    }

                    for (let i = 0; i < argCount; i++) {
                        printType(` - arg ${i + 1} type :\t`, args[i + 2]);
                        printValue(` - arg ${i + 1} value:\t`, args[i + 2]);
                    }
                    // console.log(fg.yellow, `🟡 ----- ${target} -----`, reset);
                },
                onLeave: function (ret) {
                    console.log(fg.yellow, `🟠 ----- ${method} -----`, reset);
                    printType(" - return type :\t", ret);
                    printValue(" - return value:\t", ret);
                    console.log(fg.red, `🔴 <<<<< ${method} <<<<<`, reset);
                }
            });
        }

    } catch (err) {
        console.warn(`[WARNING] Failed to intercept: ${method} with error: ${err}`);
    }
}

console.info("Script loaded successfully.");

if (ObjC.available) {
    setImmediate(autoInterceptClasses, classesWithoutBacktrace);
    setImmediate(autoInterceptClasses, classesWithBacktrace, true);
    setImmediate(autoInterceptMethods, methodsWithoutBacktrace);
    setImmediate(autoInterceptMethods, methodsWithBacktrace, true);
} else {
    console.error("[ERROR] Objective-C Runtime is not available!");
}
