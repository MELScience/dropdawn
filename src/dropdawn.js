
function Dropdawn(options) {
    if (!(this instanceof Dropdawn)) {
        return new Dropdawn(options);
    }

    if (!options) {
        throw new Error('Don\'t forget to pass options object');
    }

    if (!options.onShouldOpen) {
        throw new Error('Don\'t forget to pass options.onShouldOpen handler');
    }

    if (!options.onShouldClose) {
        throw new Error('Don\'t forget to pass options.onShouldClose handler');
    }

    options = options || {};

    this.maybeOpened = false;

    this.dropdownNode = null;
    this.dropdownContainer = null;

    var that = this;

    this._onFocus = function(event) {
        if (options.showOnFocus) {
            options.onShouldOpen();
            that.maybeOpened = true;
        }
    };

    this._onClick = function(event) {
        options.onShouldOpen();
        that.maybeOpened = true;
    };

    this._onClickOutside = function(event) {
        that._checkNodeToBlur(event.target);
    };

    this._checkNodeToBlur = function(relatedTarget) {
        // If node is TextNode — IE will fail to check that node contains
        // in container with '.contains' method, so we need to find Element parent :)
        if (relatedTarget && relatedTarget.nodeType === 3) {
            relatedTarget = relatedTarget.parentNode;
        }

        if (relatedTarget) {
            if (that.dropdownNode && that.dropdownNode.contains(relatedTarget)) {
                return;
            }

            if (that.dropdownContainer && that.dropdownContainer.contains(relatedTarget)) {
                return;
            }
        }

        options.onShouldClose();
        that.maybeOpened = false;
    };

    this._onBlur = function(event) {
        that._checkNodeToBlur(event.relatedTarget || document.querySelector(':focus') || document.activeElement);
    };

    if (options.dropdownOpener) {
        this.listenDropdownOpener(options.dropdownOpener);
    }

    if (options.dropdownContainer) {
        this.listenDropdownContainer(options.dropdownContainer);
    }

    this.listenClickOutside();
};

Dropdawn.prototype.clearDropdownOpenerEvents = function() {
    if (!this.dropdownNode) {
        return;
    }

    this.dropdownNode.removeEventListener('click', this._onClick, true);
    this.dropdownNode.removeEventListener('focus', this._onFocus, true);
    this.dropdownNode.removeEventListener('blur', this._onBlur, true);
};

Dropdawn.prototype.listenDropdownOpener = function(node) {
    if (this.dropdownNode === node) {
        return;
    }

    if (this.dropdownNode) {
        this.clearDropdownOpenerEvents();
    }

    this.dropdownNode = node;

    if (this.dropdownNode) {
        this.dropdownNode.addEventListener('click', this._onClick, true);
        this.dropdownNode.addEventListener('focus', this._onFocus, true);
        this.dropdownNode.addEventListener('blur', this._onBlur, true);
    }
};

Dropdawn.prototype.clearDropdownContainerEvents = function() {
    if (!this.dropdownContainer) {
        return;
    }

    this.dropdownContainer.removeEventListener('blur', this._onBlur, true);
};

Dropdawn.prototype.listenDropdownContainer = function(node) {
    if (this.dropdownContainer === node) {
        return;
    }

    if (this.dropdownContainer) {
        this.clearDropdownContainerEvents();
    }

    this.dropdownContainer = node;

    if (this.dropdownContainer) {
        this.dropdownContainer.addEventListener('blur', this._onBlur, true);
    }
};

// Safari in most cases does not fire focus and blur events for buttons and links,
// and unless you enable (as I remember, I may mistaken) in settings — no keyboard navigation for links and buttons
// only for inputs and textarea's by default.
//
// Touch events used for mobile browsers, in mobile Safari clicks are not propagating unless one of following conditions:
// 1. Element you clicked have style `cursor: pointer;`
// 2. Element has onClick listener
// Some android devices works better with mouseup :)
var supportsPassive = false;
Dropdawn.prototype.listenClickOutside = function() {
    try {
        var opts = Object.defineProperty({}, 'passive', {
            get: function() {
                supportsPassive = true;
            }
        });
        window.addEventListener("test", null, opts);
    } catch (e) {}

    document.documentElement.addEventListener('click', this._onClickOutside, false);
    document.documentElement.addEventListener('mouseup', this._onClickOutside, false);
    document.documentElement.addEventListener('touchend', this._onClickOutside, supportsPassive ? { passive: true } : false);
};

Dropdawn.prototype.clearClickOutside = function() {
    document.documentElement.removeEventListener('click', this._onClickOutside, false);
    document.documentElement.removeEventListener('mouseup', this._onClickOutside, false);
    document.documentElement.removeEventListener('touchend', this._onClickOutside, supportsPassive ? { passive: true } : false);
};

Dropdawn.prototype.destroy = function() {
    this.clearDropdownContainerEvents();
    this.clearDropdownOpenerEvents();
    this.clearClickOutside();

    this.maybeOpened = false;
    this.dropdownNode = null;
    this.dropdownContainer = null;
    this._onFocus = null;
    this._onClick = null;
    this._onBlur = null;
};

module.exports = Dropdawn;