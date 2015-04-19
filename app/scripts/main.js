console.log('allo allo1');

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

var obj = new MyCtor(document.getElementById("foo"), "initial");

window.app = obj;


