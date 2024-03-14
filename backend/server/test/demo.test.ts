import { describe } from 'mocha';
import { expect } from 'chai';

describe('Dummy test', () => {

    it('should run', () => {
        const dummy: boolean = true;
        expect(dummy).to.equal(true);
    })
})