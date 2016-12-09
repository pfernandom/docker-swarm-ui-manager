import { expect } from 'chai';
import testUtils from './utils';

describe('application launch', function () {

    beforeEach(testUtils.beforeEach);
    afterEach(testUtils.afterEach);

    it('shows Nodes title on screen after launch', function () {
        return this.app.client.getText('#title').then(function (text) {
            expect(text).to.equal('Nodes');
        });
    });
});
