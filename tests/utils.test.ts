import 'jest'
import * as util from '../src/utils/util'

describe( 'Tests utils', () => {

    it( 'Tests sleep function', async ( done ) => {
        const ms = 20
        const initTime = Date.now()
        const sum = initTime + ms
        await util.sleep( ms )
        const afterTime = Date.now()
        expect( sum ).toBeLessThanOrEqual( afterTime )
        done()
    } )

    it( 'Tests getFunctionName', async ( done ) => {
        let functionName
        const func = () => functionName = util.getFunctionName()
        func()
        expect( functionName ).toEqual( 'func' )
        done()
    } )

    it( 'Tests format Date from timestamp', async ( done ) => {
        const timeStamp = 1577880000
        const formated = util.formatDateFromTimestamp( timeStamp )
        expect( formated ).toBe( '2020-01-03' )
        done()
    } )

    it( 'Tests format Date from ISO Format', async ( done ) => {
        const date = new Date( 1577880000 * 1000 )
        const formated = util.formatDateFromIsoFormat( date.toISOString() )
        expect( formated ).toBe( '01/01/2020' )
        done()
    } )

    it( 'Tests if a variable is a Number', async ( done ) => {
        expect( util.isNumber( '' ) ).toBeFalsy()
        expect( util.isNumber( 0 ) ).toBeTruthy()
        done()
    } )
} )
