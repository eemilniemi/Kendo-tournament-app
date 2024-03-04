import { expect } from 'chai'
import { describe } from 'mocha'
import { add } from '../../src/test_demos/add_demo'

describe('add', () => {

    it('should work with positive numbers', () => {
        expect(add(2, 3)).to.equal(5)
    })

    it('should work with negative numbers', () => {
        expect(add(-2, -3)).to.equal(-5)
    })

    it('should work with zeros', () => {
        expect(add(-2, 0)).to.equal(-2)
    })

})

// TODO: selvitä saako testifilut toimimaan ilman että mocha pitää importata jokaiseen erikseen
