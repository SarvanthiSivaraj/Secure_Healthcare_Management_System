try {
    console.log('Requiring app...');
    require('./src/app');
    console.log('App required successfully.');
} catch (err) {
    console.error('Error requiring app:', err);
}
