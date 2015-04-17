'use strict';

describe('tests should', function(){

    beforeEach(function(){
        console.log('before each');
    });



    afterEach(function () {
        console.log('afterEach');
      });


    it('add 1 and 1 to 2', function(){
        expect(1 + 1).toBe(2);
      });
    
});
    
