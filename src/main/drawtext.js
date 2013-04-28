;(function(glob, undefined) {
	'use strict'

	// Just doing everything in the lexer for now
	// instead of creating an actual parser
	// as it is pretty simple
	var rules = {
		initial: {
			'<font': function(text, lexed) {
				lexed.state('font');
				lexed.tree.openNode();
				return Lexed.IGNORE;
			},

			'</font>': function(text, lexed) {
				lexed.tree.closeNode();
				return Lexed.IGNORE;
			},
			
			'<': function(text, lexed) {
				lexed.state('tag');
				return Lexed.IGNORE;
			},

			'[^<>]+': function(text, lexed) {
				lexed.tree.addText(text);
				return '';
			}
		},

		font: {
			'color="': function(text, lexed) {
				lexed.state('color');
				return Lexed.IGNORE;
			},

			'face="': function(text, lexed) {
				lexed.state('face');
				return Lexed.IGNORE;
			},

			'[^fc><]+': Lexed.IGNORE,

			'f': Lexed.IGNORE,
			'c': Lexed.IGNORE,

			'>': function(text, lexed) {
				lexed.state('initial');
				return Lexed.IGNORE;
			}
		},

		face: {
			'[^"]+': function(text, lexed) {
				lexed.tree.setFace(text);
				return '';
			},

			'"': function(text, lexed) {
				lexed.state('font');
				return Lexed.IGNORE;
			}
		},

		color: {
			'[^"]+': function(text, lexed) {
				lexed.tree.setColor(text);
				return '';
			},

			'"': function(text, lexed) {
				lexed.state('font');
				return Lexed.IGNORE;
			}
		},

		tag: {
			'[^>]+>': function(text, lexed) {
				lexed.state('initial');
				return Lexed.IGNORE;
			}
		}
	};

	function Node(parent) {
		this.children = [];
		this.parent = parent;
		this.text = '';
	}

	Node.prototype = {
		addChild: function(node) {
			this.children.push(node);
		}
	};

	function FontTree() {
		this._root = new Node();
		this._currNode = this._root;
	}

	FontTree.prototype = {
		openNode: function() {
			var node = new Node(this._currNode);
			this._currNode.addChild(node);
			this._currNode = node;
		},

		closeNode: function() {
			this._currNode = this._currNode.parent;
		},

		addText: function(text) {
			this._currNode.text += text;
		},

		setColor: function(color) {
			this._currNode.color = color;
		},

		setFace: function(face) {
			this._currNode.face = face;
		}
	};

	var drawText = {
		draw: function(text, opts) {
			opts || (opts = {})

			if (!opts.canvas)
				throw "Must provide a canvas to draw on"

			var l = new Lexed(text, null, rules);
			l.tree = new FontTree();

			while(l.lex() != Lexed.EOF);

			console.log(l.tree);
		}
	};

	glob.drawText = drawText
}(this));