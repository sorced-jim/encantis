import binaryen from "binaryen"
import assert from "assert"

// Create a module to work on
const module = new binaryen.Module();

// Start to create the function, starting with the contents: Get the 0 and
// 1 arguments, and add them, then return them
const left = module.local.get(0, binaryen.i32);
const right = module.local.get(1, binaryen.i32);
const add = module.i32.add(left, right);
const ret = module.return(add);

// Create the add function
// Note: no additional local variables (that's the [])
const ii = binaryen.createType([binaryen.i32, binaryen.i32])
module.addFunction('adder', ii, binaryen.i32, [], ret);

// Export the function, so we can call it later (for simplicity we
// export it as the same name as it has internally)
module.addFunctionExport('adder', 'adder');

// Print out the text
console.log(module.emitText());

// Optimize the module! This removes the 'return', since the
// output of the add can just fall through
module.optimize();

// Print out the optimized module's text
console.log('optimized:\n\n' + module.emitText());

// Get the binary in typed array form
const binary = module.emitBinary();
console.log('binary size: ' + binary.length);
console.log();
assert(module.validate());

// We don't need the Binaryen module anymore, so we can tell it to
// clean itself up
module.dispose();

// Compile the binary and create an instance
const wasm = new WebAssembly.Instance(new WebAssembly.Module(binary), {})
console.log("exports: " + Object.keys(wasm.exports).sort().join(","));
console.log();

// Call the code!
console.log('an addition: ' + wasm.exports.adder(40, 2));
