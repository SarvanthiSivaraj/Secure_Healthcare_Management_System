try {
    console.log('Loading app...');
    const app = require('./src/app');
    console.log('App loaded successfully');
} catch (error) {
    console.error('Failed to load app:', error);
}

try {
    console.log('Loading visit routes...');
    const visitRoutes = require('./src/modules/visit/visit.routes');
    console.log('Visit routes loaded successfully');
} catch (error) {
    console.error('Failed to load visit routes:', error);
}
