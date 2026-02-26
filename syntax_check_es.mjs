import fs from 'fs';
import path from 'path';

const checkDir = (dir) => {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            checkDir(fullPath);
        } else if (fullPath.endsWith('.js') && file !== 'patch_capture.js' && file !== 'patch_tests.js') {
            try {
                // simple esprima or basic acorn check
                import(path.resolve(fullPath));
            } catch (e) {
                console.error(`Syntax error in ${fullPath}`, e);
            }
        }
    }
}
// checkDir('./js');
console.log("ES modules syntax test via node requires specific flags or a library, will use another method");
