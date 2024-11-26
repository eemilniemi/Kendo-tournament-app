import * as Helper from './testHelpers';

// Initialize test database before running tests
// and close the connection after all tests have been run

before(async () => {
    await Helper.initializeTestDb();
});

after(async () => {
    await Helper.closeTestDb();
});

