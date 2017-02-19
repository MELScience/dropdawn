
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

    this._onFocus = (function(event) {
        if (options.showOnFocus) {
            options.onShouldOpen();
            this.maybeOpened = true;
        }
    }).bind(this);

    this._onClick = (function(event) {
        options.onShouldOpen();
        this.maybeOpened = true;
    }).bind(this);

    this._checkNodeToBlur = (function(relatedTarget) {
        // If node is TextNode — IE will fail to check that node contains
        // in container with '.contains' method, so we need to find Element parent :)
        if (relatedTarget && relatedTarget.nodeType === 3) {
            relatedTarget = relatedTarget.parentNode;
        }

        if (relatedTarget) {
            if (this.dropdownNode && this.dropdownNode.contains(relatedTarget)) {
                return;
            }

            if (this.dropdownContainer && this.dropdownContainer.contains(relatedTarget)) {
                return;
            }
        }

        options.onShouldClose();
        this.maybeOpened = false;
    }).bind(this);

    this._onBlur = (function(event) {
        this._checkNodeToBlur('relatedTarget' in event ?
            event.relatedTarget : document.activeElement
        );
    }).bind(this);

    this._dirtyCheck = (function() {
        var element = document.activeElement;

        if (
            options.showOnFocus &&
            document.hasFocus() &&
            element && this.dropdownNode
            && this.dropdownNode.contains(element)
        ) {
            options.onShouldOpen();
            this.maybeOpened = true;
        } else if (this.maybeOpened) {
            this._checkNodeToBlur(element);
        }
    }).bind(this);

    if (options.dropdownOpener) {
        this.listenDropdownOpener(options.dropdownOpener);
    }

    if (options.dropdownContainer) {
        this.listenDropdownContainer(options.dropdownContainer);
    }

    if (!options.disableDirtyCheck) {
        this._dirtyCheck();


        // setInterval instead of recursive setTimeout,
        // cos setTimeout may be lost if tab is in sleep mode
        // (example — change tab on mobile safari and wait for few seconds — all timers will be lost :)
        this._interval = setInterval(this._dirtyCheck, options.dirtyCheckInterval || 500);
    }
};

Dropdawn.prototype.clearDropdownOpenerEvents = function() {
    if (!this.dropdownNode) {
        return;
    }

    this.dropdownNode.removeEventListener('click', this._onClick, true);
    this.dropdownNode.removeEventListener('focus', this._onFocus, true);
    this.dropdownNode.removeEventListener('blur', this._onBlur, true);
};

Dropdawn.prototype.clearDropdownContainerEvents = function() {
    if (!this.dropdownContainer) {
        return;
    }

    this.dropdownContainer.removeEventListener('focus', this._onFocus, true);
    this.dropdownContainer.removeEventListener('blur', this._onBlur, true);
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

Dropdawn.prototype.destroy = function() {
    clearInterval(this._interval);
    this.clearDropdownContainerEvents();
    this.clearDropdownOpenerEvents();

    this.maybeOpened = false;
    this.dropdownNode = null;
    this.dropdownContainer = null;
    this._onFocus = null;
    this._onClick = null;
    this._onBlur = null;
    this._dirtyCheck = null;
};

module.exports = Dropdawn;