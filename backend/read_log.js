const fs = require('fs');
const lines = fs.readFileSync('logs/error.log', 'utf8').trim().split('\n');
const lastLines = lines.slice(-5);
lastLines.forEach(line => {
    try {
        const parsed = JSON.parse(line);
        console.log(JSON.stringify(parsed, null, 2));
    } catch (e) {
        console.log(line);
    }
});
