import 'jest'
import { mount } from 'enzyme'
import { createRequest, createResponse, } from 'node-mocks-http'
import Home from '../src/pages/index'

describe( 'Isolated Test', () => {

    const next = jest.fn()
    const response = createResponse()
    const request = createRequest( { method: 'GET', url: '/', } )

    it( 'should render without crashing', () => {
        const wrapper = mount( <Home /> )

        expect( wrapper.find( '.main' ).find( 'h1' ) ).toHaveLength( 1 )
    } )
} )

