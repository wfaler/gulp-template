function guid(){
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
        return v.toString(16);
    });
}
    

function filter(arr, pred){
    var n = [];
    for(var i = 0; i < arr.length; i++){
        if(pred(arr[i])){
            n.push(arr[i]);
        }
    }
    return n;
}


function map(arr,fn){
    var n = [];
    for(var i = 0; i < arr.length; i++){
        n.push(fn(arr[i]));
    }
    return n;
}

function deepValue(obj, path){
    for (var i=0, path=path.split('.'), len=path.length; i<len; i++){
        obj = obj[path[i]];
    };
    return obj;
};


function formAction(form,fn){
    var formVals = {};
    map(filter(form.elements, function(e){
        var name = e.tagName.toLowerCase();
        return (name === 'input') || (name === 'select');
    }), function(e){
        var tpe = e.getAttribute('type');
        if(tpe !== null){
            tpe = tpe.toLowerCase();
        }
        if(e.tagName.toLowerCase() === 'select'){
            var options = jQuery(e).children().filter(':selected');
            formVals[e.name] = map(options, function(o){
                return jQuery(o).data('data');
            });
            if(e.getAttribute('multiple') == null){
                if(formVals[e.name].length > 0){
                    formVals[e.name] = formVals[e.name][0];
                }else{
                    formVals[e.name] = null;
                }
            }          
        }else if(tpe !== null && tpe === 'checkbox'){
            if(formVals[e.name] === undefined){
                formVals[e.name] = [];
            }
            if(e.checked){
                console.log(formVals[e.name]);
                formVals[e.name].push(jQuery(e).data('data'));
            }
        }else if(tpe !== null && tpe === 'radio'){
            formVals[e.name].push(jQuery(e).data('data'));
        }else{
            formVals[e.name] = e.value;
        }
        return formVals;
    });
    fn(formVals);
}

function fillElement(elem, value){
    jQuery(elem).text(value.fruit);
    elem.value = guid();
    jQuery(elem).data('data', value);
}

function evalMarkup(){
    var forms = document.getElementsByTagName('form');
    map(forms, function(f){
        var attr = f.getAttribute('form-action');
         if(attr !== null){
             var fn = deepValue(window,attr);
             jQuery(f).submit(function(evt){
                 evt.preventDefault();
                 formAction(f,fn);                 
             });
        }       
    });

    var repeaters = jQuery('[repeater]');
    map(repeaters, function(r){
        var repeatExpr = r.getAttribute('repeater');
        var values = deepValue(window,repeatExpr)();
        // fix repeated adding to thingy
        for(var i = 0;i < values.length;i++){
            var c = r.cloneNode(r);
            if(i > 0){
                c.removeAttribute('repeater');
            }
            fillElement(c, values[i]);
            jQuery(c).insertAfter(r);            
        }
        
    });
}

//------
function MyCtor(element, data) {
    this.data = data;
    this.element = element;
    element.value = data;
    element.addEventListener("change", this, false);
}


MyCtor.prototype.handleEvent = function(event) {
    switch (event.type) {
        case "change": this.change(this.element.value);
    }
};

MyCtor.prototype.change = function(value) {
    this.data = value;
    this.element.value = value;
};

var foo = {hello : function(f){
    console.log('hello!');
    console.log(f);
}, repeaterFn: function(){
    return [{fruit: "Apple"},{fruit: "Orange"}];
}};


evalMarkup();

console.log(JSON.stringify({foo:'baz'}));
