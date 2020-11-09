/* bender-tags: editor */
/* bender-ckeditor-plugins: autocomplete */

( function() {
	'use strict';

	bender.editors = {
		classic: {},

		inline: {
			creator: 'inline'
		},

		divarea: {
			extraPlugins: 'divarea'
		}
	};

	var tests = {
		setUp: function() {
			bender.tools.ignoreUnsupportedEnvironment( 'autocomplete' );
		},

		'test position not enough space between the caret and bottom viewport': function( editor ) {
			// +---------------------------------------------+
			// |                                             |
			// |       editor viewport                       |
			// |     +--------------+                        |
			// |     |              |                        |
			// |     |     view     |                        |
			// |     |              |                        |
			// |     +--------------+                        |
			// |     █ - caret position                      |
			// |                                             |
			// +---------------------------------------------+
			var view = createPositionedView( editor, {
				caretRect: { top: 400, bottom: 410, left: 100 },
				editorViewportRect: { top: 0, bottom: 500 },
				viewPanelHeight: 100
			} );

			assert.areEqual( '300px', view.element.getStyle( 'top' ), 'View is displayed above the caret' );
			assert.areEqual( '100px', view.element.getStyle( 'left' ) );
		},

		'test position not enough space between the caret and bottom viewport - edge case': function( editor ) {
			// +---------------------------------------------+
			// |                                             |
			// |                                             |
			// |       editor viewport                       |
			// |     +--------------+                        |
			// |     |              |                        |
			// |     |     view     |                        |
			// |     |              |                        |
			// |     +--------------+                        |
			// +-----█---------------------------------------+
			//  			- caret position 1px above the viewport's bottom position
			var view = createPositionedView( editor, {
				caretRect: { top: 199, bottom: 209, left: 100 },
				editorViewportRect: { top: 0, bottom: 200 },
				viewPanelHeight: 100
			} );

			assert.areEqual( '99px', view.element.getStyle( 'top' ), 'View is displayed above the caret' );
			assert.areEqual( '100px', view.element.getStyle( 'left' ) );
		},

		'test enough space under and above the caret': function( editor ) {
			// +---------------------------------------------+
			// |       editor viewport                       |
			// |                                             |
			// |                                             |
			// |                                             |
			// |     █ - caret position                      |
			// |     +--------------+                        |
			// |     |     view     |                        |
			// |     +--------------+                        |
			// |                                             |
			// |                                             |
			// +---------------------------------------------+
			var view = createPositionedView( editor, {
				caretRect: { top: 100, bottom: 110, left: 50 },
				editorViewportRect: { top: 0, bottom: 500 },
				viewPanelHeight: 100
			} );

			assert.areEqual( '110px', view.element.getStyle( 'top' ), 'View is displayed below the caret' );
			assert.areEqual( '50px', view.element.getStyle( 'left' ) );
		},

		'test enough space under the caret - edge case': function( editor ) {
			//         - caret top position on a par with viewport's top
			// +-----█---------------------------------------+
			// |     +--------------+                        |
			// |     |     view     |                        |
			// |     +--------------+                        |
			// |                                             |
			// |                                             |
			// |      editor viewport                        |
			// +---------------------------------------------+
			var view = createPositionedView( editor, {
				caretRect: { top: 0, bottom: 10, left: 50 },
				editorViewportRect: { top: 0, bottom: 200 },
				viewPanelHeight: 100
			} );

			assert.areEqual( '10px', view.element.getStyle( 'top' ), 'View is displayed below the caret' );
			assert.areEqual( '50px', view.element.getStyle( 'left' ) );
		},

		'test view position below viewport': function( editor ) {
			// +---------------------------------------------+
			// |       editor viewport                       |
			// |                                             |
			// |     +--------------+                        |
			// |     |              |                        |
			// |     |     view     |                        |
			// |     |              |                        |
			// +-----+==============+------------------------+
			// |                                             |
			// |     █ - caret position                      |
			// |                                             |
			// +---------------------------------------------+
			var view = createPositionedView( editor, {
				caretRect: { top: 400, bottom: 410, left: 100 },
				editorViewportRect: { top: 0, bottom: 300 },
				viewPanelHeight: 100
			} );

			assert.areEqual( '200px', view.element.getStyle( 'top' ), 'View is displayed above the caret' );
			assert.areEqual( '100px', view.element.getStyle( 'left' ) );
		},

		'test view position above viewport': function( editor ) {
			// +---------------------------------------------+
			// |                                             |
			// |     █ - caret position                      |
			// |                                             |
			// +-----+==============+------------------------+
			// |     |              |                        |
			// |     |     view     |                        |
			// |     |              |                        |
			// |     +--------------+                        |
			// |                                             |
			// |       editor viewport                       |
			// +---------------------------------------------+
			var view = createPositionedView( editor, {
				caretRect: { top: 100, bottom: 110, left: 50 },
				editorViewportRect: { top: 200, bottom: 500 },
				viewPanelHeight: 100
			} );

			assert.areEqual( '200px', view.element.getStyle( 'top' ), 'View is displayed below the caret' );
			assert.areEqual( '50px', view.element.getStyle( 'left' ) );
		},

		// (#3582)
		'test view position wraps on bottom window border': function( editor ) {
			// +---------------------------------------------+
			// |               editor viewport               |
			// |                                             |
			// |                                             |
			// |                  +--------------+           |
			// |                  |     view     |           |
			// |                  +--------------+           |
			// | caret position - █                          |
			// |                                             |
			// =============================================== - bottom window border
			// |                                             |
			// |                                             |
			// +---------------------------------------------+
			var getViewPaneSizeStub = sinon.stub( CKEDITOR.dom.window.prototype, 'getViewPaneSize' ).returns( { height: 150, width: 300 } ),
				view = createPositionedView( editor, {
					caretRect: { top: 100, bottom: 110, left: 50 },
					editorViewportRect: { top: 0, bottom: 500 },
					viewPanelHeight: 100
				} );

			getViewPaneSizeStub.restore();

			assert.areEqual( '0px', view.element.getStyle( 'top' ), 'View should be displayed above the caret.' );
			assert.areEqual( '50px', view.element.getStyle( 'left' ), 'View should not be moved horizontally.' );
		},

		// (#3582)
		'test view position sticks to right window border': function( editor ) {
			// +---------------------------------------------+   ||
			// |               editor viewport               |   ||
			// |                                             |   ||
			// |                                             |   ||
			// |                         caret position - █  |   || - right window border
			// |                                 +--------------+||
			// |                                 |              |||
			// |                                 |     view     |||
			// |                                 |              |||
			// |                                 +--------------+||
			// |                                             |   ||
			// +---------------------------------------------+   ||
			var getViewPaneSizeStub = sinon.stub( CKEDITOR.dom.window.prototype, 'getViewPaneSize' ).returns( { height: 300, width: 300 } ),
				view = createPositionedView( editor, {
					caretRect: { top: 100, bottom: 110, left: 250 },
					editorViewportRect: { top: 0, bottom: 500 },
					viewPanelHeight: 100
				} );

			getViewPaneSizeStub.restore();

			assert.areEqual( '110px', view.element.getStyle( 'top' ), 'View should be displayed below the caret.' );
			assert.areEqual( '200px', view.element.getStyle( 'left' ), 'View should be glued to the right window border.' );
		},

		// (#3582)
		'test view position stays within top window border': function( editor ) {
			// +==== caret position - █ =====================+ - top window border
			// |                      +--------------+       |
			// |                      |     view     |       |
			// |                      +--------------+       |
			// |                                             |
			// |                                             |
			// |                                             |
			// |                                             |
			// |                                             |
			// |               editor viewport               |
			// +---------------------------------------------+
			var getViewPaneSizeStub = sinon.stub( CKEDITOR.dom.window.prototype, 'getViewPaneSize' ).returns( { height: 300, width: 300 } ),
				view = createPositionedView( editor, {
					caretRect: { top: 0, bottom: 10, left: 50 },
					editorViewportRect: { top: 0, bottom: 500 },
					viewPanelHeight: 100
				} );

			getViewPaneSizeStub.restore();

			assert.areEqual( '10px', view.element.getStyle( 'top' ), 'View should be displayed below the caret.' );
			assert.areEqual( '50px', view.element.getStyle( 'left' ), 'View should not be moved horizontally.' );
		},

		// (#3582)
		'test view position stays within left window border': function( editor ) {
			// || - left window border
			// ||
			// || +---------------------------------------------+
			// || |               editor viewport               |
			// || |                                             |
			// || █ - caret position                            |
			// || +--------------+                              |
			// || |     view     |                              |
			// || +--------------+                              |
			// || |                                             |
			// || |                                             |
			// || |                                             |
			// || |                                             |
			// || +---------------------------------------------+
			var getViewPaneSizeStub = sinon.stub( CKEDITOR.dom.window.prototype, 'getViewPaneSize' ).returns( { height: 300, width: 300 } ),
				view = createPositionedView( editor, {
					caretRect: { top: 100, bottom: 110, left: 0 },
					editorViewportRect: { top: 0, bottom: 500 },
					viewPanelHeight: 100
				} );

			getViewPaneSizeStub.restore();

			assert.areEqual( '110px', view.element.getStyle( 'top' ), 'View should be displayed below the caret.' );
			assert.areEqual( '0px', view.element.getStyle( 'left' ), 'View should not be moved horizontally.' );
		}
	};

	tests = bender.tools.createTestsForEditors( CKEDITOR.tools.object.keys( bender.editors ), tests );

	bender.test( tests );

	function createPositionedView( editor, config ) {
		var view = new CKEDITOR.plugins.autocomplete.view( editor ),
			getClientRectStub = sinon.stub( CKEDITOR.dom.element.prototype, 'getClientRect' ).returns( config.editorViewportRect );

		view.append();

		sinon.stub( view.element, 'getSize' ).returns( config.viewPanelHeight );

		view.setPosition( config.caretRect );

		getClientRectStub.restore();

		return view;
	}

} )();
