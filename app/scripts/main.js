var Bowler = new function() {
    var templateCache = {};
    var nsSelf = this;
    var components = {};
    var componentCache = {};
    
    this.guid = function(){
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
            return v.toString(16);
        });
    };
    
    this.filter = function(arr, pred){
        var n = [];
        for(var i = 0; i < arr.length; i++){
            if(pred(arr[i])){
                n.push(arr[i]);
            }
        }
        return n;
    };
    
    
    this.map = function(arr,fn){
        var n = [];
        for(var i = 0; i < arr.length; i++){
            n.push(fn(arr[i]));
        }
        return n;
    };
    
    this.getOrElse = function(val, defaultVal){
        if(val === null || val === undefined){
            return defaultVal;
        }else{
            return val;
        }
    };
    
    this.deepValue = function(obj, path){
        for (var i=0, path=path.split('.'), len=path.length; i<len; i++){
            obj = obj[path[i]];
        };
        return obj;
    };
    
    this.formAction = function(form,fn){
        var formVals = {};
        this.map(this.filter(form.elements, function(e){
            var name = e.tagName.toLowerCase();
            return (name === 'input') || (name === 'select');
        }), function(e){
            var tpe = e.getAttribute('type');
            if(tpe !== null){
                tpe = tpe.toLowerCase();
            }
            if(e.tagName.toLowerCase() === 'select'){
                var options = jQuery(e).children().filter(':selected');
                formVals[e.name] = nsSelf.map(options, function(o){
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
                formVals[e.name].push(nsSelf.getOrElse(jQuery(e).data('data'), e.value));
            }
        }else if(tpe !== null && tpe === 'radio'){
            if(jQuery(e).prop('checked')){
                formVals[e.name] = nsSelf.getOrElse(jQuery(e).data('data'),e.value);
            }
        }else{
            formVals[e.name] = e.value;
        }
            return formVals;
        });
        fn(formVals);
    };

    
    // dont re-add submit handlers
    this.render = function(root){
        if(root === null || root === undefined){
            root = jQuery( ":root" );
        }
        this.renderComponents(root);
        
        this.map(jQuery(root).find('form'), function(f){
            var attr = f.getAttribute('form-action');
            if(attr !== null){
                var fn = nsSelf.deepValue(window,attr);
                jQuery(f).submit(function(evt){
                    evt.preventDefault();
                    nsSelf.formAction(f,fn);                 
                });
            }       
        });
        
        this.map(jQuery(root).find('[repeater]'), function(r){
            var repeatExpr = r.getAttribute('repeater');
            nsSelf.attachData(r,'repeater')(nsSelf.deepValue(window,repeatExpr)());
        });
        
        this.map(jQuery(root).find('[url-repeater]'), function(r){
            var sourceUrl = r.getAttribute('url-repeater');
            jQuery.get(sourceUrl, nsSelf.attachData(r,'url-repeater'));
            
        });
    };

    this.renderComponents = function(root){
        this.map(jQuery(root).find('[component-id]'), function(toReplace){
//            jQuery(toReplace).replaceWith(componentCache[toReplace.getAttribute('component-id')]);
        });
        for(var key in components){
            this.map(jQuery(root).find(key), function(cElem){
                var dataKey = cElem.getAttribute('data');
                var context = nsSelf.deepValue(window,dataKey);
                var component = jQuery.parseHTML(components[key](context));
                jQuery(component).data('data',context);
                var uuid = nsSelf.guid();
                jQuery(component).attr('component-id', uuid);
                componentCache[uuid] = cElem;
                jQuery(cElem).replaceWith(component);
            });
        }

    };
    
    this.attachData = function(dataElement, attribute){
        return function(values){
            var parentNode = dataElement.parentNode;
            var template = null;
            if(parentNode.getAttribute('template-id') !== null){
                template = templateCache[parentNode.getAttribute('template-id')];
            }else{
                var templateString = jQuery(dataElement.parentNode).clone().html();
                template = Handlebars.compile(templateString);
                var uuid = nsSelf.guid();
                templateCache[uuid] = template;
                jQuery(parentNode).attr('template-id',uuid);
            }
            jQuery(dataElement.parentNode).empty();
            for(var i = 0;i < values.length;i++){            
                var element = jQuery.parseHTML(template(values[i]));
                if(i > 0){
                    jQuery(element).removeAttr(attribute);
                }
                jQuery(element).data('data', values[i]);
                jQuery(element).appendTo(parentNode);
            }
            jQuery(dataElement).remove();
        };   
    };

    this.registerTemplate = function(t){
        if(jQuery.isArray(t)){
            this.map(t,this.registerTemplate);
        }else{
            jQuery.get(t.path, function(data){
                var template = Handlebars.compile(data);
                components[t.name] = template;
            });
        }
    };

    this.start = function(){
        $(window.document).ajaxStop(function() {
            Bowler.render();
            $(window.document).off();
        });
    };
    
};


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
    console.log(f);
}, repeaterFn: function(){
    return [{fruit: "Apple"},{fruit: "Orange"}];
}};

var greetings = {greeting: 'howdy partner',greetings: function(){
    return 'a function greeting';
}};


Bowler.registerTemplate({name: 'foo', path: '/scripts/components/foo.html'});

Bowler.start();
