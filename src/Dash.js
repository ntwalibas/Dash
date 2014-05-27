/*!
 * Dash Javascript Testing Framework
 *
 * @author        Ntwali Bashige <ntwali.bashige@gmail.com>
 * @copyright     2014 Ntwali Bashige
 * @link          https://github.com/ntwalibas/Dash
 * @license       https://github.com/ntwalibas/Dash/blob/master/LICENSE.md
 * @version       0.0.1
 *
 * MIT LICENSE
 *
 * Permission is hereby granted, free of charge, to any person obtaining
 * a copy of this software and associated documentation files (the
 * "Software"), to deal in the Software without restriction, including
 * without limitation the rights to use, copy, modify, merge, publish,
 * distribute, sublicense, and/or sell copies of the Software, and to
 * permit persons to whom the Software is furnished to do so, subject to
 * the following conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
 * LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
 * OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
 * WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

;(function (window){
    "use strict";

	/*** Dash Constructor Begins ***/
	var Dash = function () {
		// Make sure we always return  a valid instance of the Dash class in case the user called the class itself instead of an intance
		if ( !(this instanceof Dash) ) {			
			return new Dash();
		}
    };
	/*** Dash Constructor Ends ***/


	/*** Static Methods Begin ***/

	/** Extends the 'root' object with passed in objects
	 *
	 * @param: 		root - the object which is ro receive properties from a second optional argument
	 * @return: 	nothing is returned by this function
	 */

	/* TODO :  Allow deep copy */
	Dash.extend = function ( root ) {
		for ( var i = 1; i < arguments.length; i++ ) {
			for ( var key in arguments[i] ) {
			  root[key] = arguments[i][key];
			}
		}
	};

	/** assertThat method  evaluates constraints and is used by assertion methods in that effect.
	 *
	 * @param: 		value - the value against which the constraint has to be tested against 
	 * @param: 		constraint - the constraint which is to evaluate the value
	 * @return: 	a boolean indicating whether the constraint failed or passed
	 */
	Dash.assertThat = function ( value, constraint ) {
		// Each constraint has an evaluate method which can receive an optional parameter 'value' and returns a 
		// boolean indicating whether the constraint passed or failed
		var res = constraint.evaluate( value );
		return res;	
	};
	/*** Static Methods End ***/


	/*** Static Methods for test suite and test case ***/

	Dash.Suite = function () {
		if ( !(this instanceof Dash.Suite) ) {
			return new Dash.Suite();
		}

		this.cases = [];
	};

	Dash.Suite.prototype.add = function ( testCase ) {
		this.cases.push( testCase );
	};

	Dash.Suite.prototype.run = function () {
		for ( var i = 0; i < this.cases.length; i++ ) {
			this.cases[i].run();
		}

		// After we are done executing the exisiting tests, we reset the test cases array and wait for new tests to be loaded.
		this.cases = [];
	};



	Dash.Case = function ( testName, testFunctions ) {
		if ( !(this instanceof Dash.Case) ) {
			return new Dash.Case( testName, testFunctions );
		}

		this.fn = [];
		this.tearDown = null
		this.setUp = null;

		// the configuration object
		this.config = {};

		this.testCase = new testFunctions();

		// First we place all methods that are not setUp or tearDown in an array
		for ( var i in this.testCase ) {
			if ( this.testCase[i] !== null && typeof this.testCase[i] === 'function' ) {
				if( i !== 'setUp' && i !== 'tearDown' ) {
					this.fn.push( i );
				}
				else if ( i === 'setUp' ) {
					this.setUp = i;
				}
				else if ( i === 'tearDown' ) {
					this.tearDown = i;
				}
			}				
		}
	};

	Dash.Case.prototype.configuration = function ( config ) {
		if( Helpers.typeOf( config ) === 'object' ) {
			this.config = config;
		}
		else {
			throw new TypeError('The configuration method is expecting an object, please supply one which is correct');
		}
	};

	Dash.Case.prototype.run = function () {
		// We first run the test functions under this test case
		for ( var j = 0; j < this.fn.length; j++ ) {
			// We run the setUp method
			if ( this.setUp !== null ) {
				this.testCase[ this.setUp ]();
			}

			// We run the test cases
			this.testCase[ this.fn[j] ]();

			// We run the tearDown method
			if ( this.tearDown !== null ) {
				this.testCase[ this.tearDown ]();
			}
		}

		// Then if there is an exisiting regression test, we run it (them) as wel
		// First we verify whether the configuration object has regression registered
		if ( Helpers.hasKey( this.config, "regressions") === true ) {
			// If there are regression set, we make sure the array is not empty
			if ( this.config['regressions'].length > 0 ) {
				// Then we run them one by one
				for ( var l = 0; l < this.config['regressions'].length; l++ ) {
					this.config['regressions'][l].run();
				}
			}			
		}
	};
	/*** End Static Methods for test suite and tes case ***/


	/*** Assertions Begin ***/

	var Assertions = {
		/** Assert that 'condition' is true 
		 *
		 * @param: 		condition - a boolean we're whose value is expected to be true after evaluation
		 * @param: 		messageCallback - the messageCallback to be displayed
		 */
		assertTrue : function ( condition, messageCallback ) {
			var res = Dash.assertThat( condition, DashConstraint.isTrue() );

			messageCallback( res );		
		},
		
		/** Assert that 'condition' is false
		 *
		 * @param: 		condition - a boolean we're whose value is expected to be false after evaluation
		 * @param: 		messageCallback - the messageCallback to be displayed 
		 */
		assertFalse : function ( condition, messageCallback ) {
			var res = !Dash.assertThat(condition, Dash.isTrue() );

			messageCallback( res );
		},
		
		/** Assert that 'element' is null
		 *
		 * @param: 		element - the element we expect to be null
		 * @param: 		messageCallback - the messageCallback to be displayed
		 */
		assertNull : function ( element, messageCallback ) {
			var res = (element === null) ? true : false;

			messageCallback( res );
		},
		
		/** Assert that 'element' isn't null
		 *
		 * @param: 		element - the element we expect to be null
		 * @param: 		messageCallback - the messageCallback to be displayed
		 */
		assertNotNull : function ( element, messageCallback ) {
			var res = (element === null) ? false : true;

			messageCallback( res );
		},
		
		/** Assert that 'expected' object and 'actual' object are references to ( instances of) the same object
		 *
		 * @param: 		expected - 
		 * @param: 		actual - 
		 * @param: 		messageCallback - the messageCallback to be displayed
		 */
		assertSame : function ( expected, actual, messageCallback ){
			var res = ( expected == actual );

			messageCallback( res );
		},
		
		/** Assert that 'expected' object and 'actual' object aren't references to ( instances of) the same object
		 *
		 * @param: 		expected - 
		 * @param: 		actual - 
		 * @param: 		messageCallback - the messageCallback to be displayed
		 */
		asserNotSame : function ( expected, actual, messageCallback ){
			var res = !( expected == actual );

			messageCallback( res );
		},
		
		/** Assert that 'actual' is exactly same ( same type and value ) with 'expected'
		 *
		 * @param: 		expected - this object is to be compared with one bellow
		 * @param: 		actual - [see above]
		 * @param: 		messageCallback - the messageCallback to be displayed
		 */
		// TODO: use better naming than 'expected' and 'actual' because they are confusing in that their naming doesn't match up with what the method
		// is actually doing
		assertPureSame : function ( expected, actual, messageCallback ) {
			var constraint = Dash.identicalTo( expected );
			var res = Dash.assertThat( actual, constraint );

			messageCallback( res );
		},
		
		/** Assert that 'actual' isn't exactly same ( same type and value ) with 'expected'
		 *
		 * @param: 		expected - this object is to be compared with one bellow
		 * @param: 		actual - [see above]
		 * @param: 		messageCallback - the messageCallback to be displayed
		 */
		// TODO: use better naming than 'expected' and 'actual' because they are confusing in that their naming doesn't match up with what the method
		// is actually doing
		assertNotPureSame : function ( expected, actual, messageCallback ) {
			var constraint = Dash.identicalTo( expected );
			var res = !( Dash.assertThat( actual, constraint ) );

			messageCallback( res );
		},
				
		/** Assert that 'expected' is equal to 'actual' 
		 *
		 * @param: 		expected - this object is to be compared with one bellow
		 * @param: 		actual - [see above]
		 * @param: 		messageCallback - the messageCallback to be displayed 
		 */
		// TODO: use better naming than 'expected' and 'actual' because they are confusing in that their naming doesn't match up with what the method
		// is actually doing
		assertEqual : function ( expected, actual, messageCallback ) {
			var constraint = Dash.equalTo( actual );
			var res = Dash.assertThat( expected, constraint );

			messageCallback( res );
		},
		
		/** Assert that 'expected' isn't equal to 'actual' 
		 *
		 * @param: 		expected - this object is to be compared with one bellow
		 * @param: 		actual - [see above]
		 * @param: 		messageCallback - the messageCallback to be displayed
		 */
		// TODO: use better naming than 'expected' and 'actual' because they are confusing in that their naming doesn't match up with what the method
		// is actually doing
		assertNotEqual : function ( expected, actual, messageCallback ) {
			var constraint = Dash.equalTo( actual );
			var res = !( Dash.assertThat( expected, constraint ) );

			messageCallback( res );
		},
				
		/** Assert that 'object' contains 'expected' 
		 *
		 * @param: 		expected - this is the property we're trying to find in the object or array bellow
		 * @param: 		object - the object or array in which we hope to find the 'expected' property or value
		 * @param: 		messageCallback - the messageCallback to be displayed
		 */
		assertContains : function ( expected, object, messageCallback ) {
			var constraint = Dash.contains( expected );
			var res = Dash.assertThat( object, constraint );

			messageCallback( res );
		},
		
		/** Assert that 'object' doesn't contains 'expected' 
		 *
		 * @param: 		expected - this is the property we're trying to find in the object or array bellow
		 * @param: 		object - the object or array in which we hope to find the 'expected' property or value
		 * @param: 		messageCallback - the messageCallback to be displayed
		 */
		assertNotContains : function ( expected, object, messageCallback ) {
			var constraint = Dash.contains( expected );
			var res = !( Dash.assertThat( object, constraint ) );

			messageCallback( res );
		},
		
		/** Assert that 'string' matches 'pattern'  
		 *
		 * @param: 		pattern - a regular expression we want to match up on the string bellow
		 * @param: 		string - the character string which we want to match up with the pattern
		 * @param: 		messageCallback - the messageCallback to be displayed 
		 */
		assertMatchRegExp : function ( pattern, string, messageCallback ) {
			var constraint = Dash.matchesRegExp( pattern );
			var res = Dash.assertThat( string, constraint );

			messageCallback( res );
		},
		
		/** Assert that 'string' doesn't match 'pattern'  
		 *
		 * @param: 		pattern - a regular expression we want to match up on the string bellow
		 * @param: 		string - the character string which we want to match up with the pattern
		 * @param: 		messageCallback - the messageCallback to be displayed
		 */
		assertNotMatchRegExp : function ( pattern, string, messageCallback ) {
			var constraint = Dash.matchesRegExp( pattern );
			var res = !( Dash.assertThat( string, constraint ) );

			messageCallback( res );
		},
		
		/** Assert that 'expect' is of type 'type' 
		 *
		 * @param: 		expect - any variable who type we want to know
		 * @param: 		type - the type we would like to find on expect
		 * @param: 		messageCallback - the messageCallback to be displayed
		 */
		assertIsType : function ( expect, type, messageCallback ) {
			var constraint = Dash.istype( type );
			var res = Dash.assertThat( expect, constraint );

			messageCallback( res );
		},
		
		/** Assert that 'expect' isn't of type 'type' 
		 *
		 * @param: 		expect - any variable who type we want to know
		 * @param: 		type - the type we would like to find on expect
		 * @param: 		messageCallback - the messageCallback to be displayed
		 */
		assertIsNotType : function ( expect, type, messageCallback ) {
			var constraint = Dash.istype( type );
			var res = !( Dash.assertThat( expect, constraint ) );

			messageCallback( res );
		},
		
		/** Assert that 'object' has property 'prop' 
		 *
		 * @param: 		prop - the property that we want to find on the object
		 * @param: 		object - the object from which we would like to find the above property
		 * @param: 		messageCallback - the messageCallback to be displayed
		 */
		assertHasProperty : function ( prop, object, messageCallback ) {
			var constraint = Dash.hasProperty( prop );
			var res = Dash.assertThat( object, constraint );

			messageCallback( res );
		},
		
		/** Assert that 'object' has property 'prop'
		 *
		 * @param: 		prop - the property that we want to find on the object
		 * @param: 		object - the object from which we would like to find the above property
		 * @param: 		messageCallback - the messageCallback to be displayed
		 */
		assertNotHasProperty : function ( prop, object, messag ) {
			var constraint = Dash.hasProperty( prop );
			var res = !( Dash.assertThat( object, constraint ) );

			messageCallback( res );
		},
		
		/** Assert that 'object' is an instance of 'klass' 
		 *
		 * @param: 		object - the object we hope to be an instance of klass
		 * @param: 		klass - the klass which is supposed to generate the object we're searching for
		 * @param: 		messageCallback - the messageCallback to be displayed
		 */
		assertInstanceOf : function ( object, klass, messageCallback ) {
			var constraint = Dash.instanceOf( klass );
			var res = Dash.assertThat( object, constraint );

			messageCallback( res );
		},
		
		/** Assert that 'object' isn't an instance of 'klass'
		 *
		 * @param: 		object - the object we hope to be an instance of klass
		 * @param: 		klass - the klass which is supposed to generate the object we're searching for
		 * @param: 		messageCallback - the messageCallback to be displayed
		 */
		assertNotInstanceOf : function ( object, klass, messageCallback ) {
			var constraint = Dash.instanceOf( klass );
			var res = !( Dash.assertThat( object, constraint ) );

			messageCallback( res );
		},

		/** Assert that whatever 'value' is we always have true as return type from the constraint
		 *
		 * @param: 		value - any object we want
		 * @param: 		messageCallback - the messageCallback to be displayed
		 */
		assertAnything : function ( value, messageCallback ) {
			var constraint = Dash.anything();
			var res = Dash.assertThat( value, constraint );

			messageCallback( res );
		}		
	};
	/*# Copy Assertions on Dash Object */
	Dash.extend( Dash, Assertions );	
	/*** Assertions Ends ***/


	/*** Dash Constraints Begin ***/	 
	var DashConstraint = {	
		logicalNot : function ( constraint ) {
			return new Constraint_Not( constraint );
		},

		equalTo : function ( value ) {
			return new Constraint_isEqual( value );
		},
		
		isTrue : function ( ) {
			return new Constraint_isTrue();
		},	
		
		logicalAnd : function ( ) {
			var constraints = Array.prototype.slice.call(arguments);
			var constraint = new Constraint_And();
			constraint.setConstraints(constraints);
			return constraint;
		},
		
		contains : function ( value ) {
			return new Constraint_Contains( value );
		},
		
		anything : function ( value ) {
			return new Constraint_isAnything( value );
		},
		
		greaterThan : function ( value ) {
			return new Constraint_greaterThan( value );
		},
		
		hasProperty : function ( value ) {
			return new Constraint_hasProperty( value );
		},
		
		identicalTo : function ( value ) {
			return new Constraint_isIdenticalTo( value );
		},
		
		instanceOf : function ( value ) {
			return new Constraint_instanceOf( value );
		},
		
		isType : function ( value ) {
			return new Constraint_isType( value );
		},
		
		lessThan : function ( value ) {
			return new Constraint_lessThan( value );
		},
		
		logicalOr : function ( ) {
			var constraints = Array.prototype.slice.call(arguments);
			var constraint = new Constraint_Or();
			constraint.setConstraints(constraints);
			return constraint;
		},
		
		logicalXor : function ( ) {
			var constraints = Array.prototype.slice.call(arguments);
			var constraint = new Constraint_Xor();
			constraint.setConstraints(constraints);
			return constraint;
		},
		
		matchesRegExp : function ( value ) {
			return new Constraint_matchesRegExp( value );
		},
		
		stringContains : function ( value ) {
			return new Constraint_stringContains( value );
		}
	};
	/*# Copy Constraints on Dash Object */
	Dash.extend( Dash, DashConstraint );

	/****
		* THESE BELLOW ARE ARE THE FUNCTIONS-OBJECTS THAT MAKE CONSTRAINTS WORK *
	****/

	/**
	 * fixme PLEASE REVISE THIS CODE TO IMPROVE DESCRIPTIONS ( CODE COMMENT ) AND PASS THEM TO ASSERTIONS METHODS
	 */

	/** CONSTRAINT NOT **/
	var Constraint_Not = function ( constraint ) {
		this.constraint = constraint;
	};

	Constraint_Not.prototype.evaluate = function(  other ){
		var success = !this.constraint.evaluate( other );
		return success;
	};

	/** CONSTRAINT IS_EQUAL **/
	var Constraint_isEqual = function ( value ) {
		this.value = value;
	};

	Constraint_isEqual.prototype.evaluate = function ( other ){
		return this.value === other ? true : false; // Equal is supposed to match the values and type, no type coercion is supposed to happen
	};

	/** CONSTRAINT IS_TRUE **/
	var Constraint_isTrue = function () {};

	Constraint_isTrue.prototype.evaluate = function ( other ) {
		return other == true;
	};

	/** CONSTRAINT LOGICAL_AND **/
	var Constraint_And = function (){
		this.constraints = [];
	};

	Constraint_And.prototype.setConstraints = function ( constraints ) {
		this.constraints = [];
		var i = 0;
		
		for ( i = 0, l =  constraints.length; i < l; i++ ) {
			this.constraints[i] = constraints[i];
		}
	};

	Constraint_And.prototype.evaluate = function ( other ) {
		var success = true;
		var constraint = null;
		
		for ( i = 0, l =  constraints.length; i < l; i++ ) {
			if( !this.constraints[i].evaluate( other ) ) {
				success = false;
				break;
			}
		}
		
		return success;
	};

	/** CONSTRAINT CONTAINS **/
	var Constraint_Contains = function ( value ){
		this.value = value;
	};
		
	Constraint_Contains.prototype.evaluate = function ( other ) {
		var success = false;
		
		if ( other.constructor === Object ) {
			for ( var i in other ) {
				if ( other[i] == this.value ) {
					success = true;
					break;
				}
			}		
		}
		else if ( other.constructor === Array ) {
			for ( var i = 0, l = other.length; i < l; i++ ) {
				if ( other[i] == this.value ) {
					success = true;
					break;
				}
			}		
		}
		return success;		
	};

	/** CONSTRAINT IS_ANYTHING **/
	var Constraint_isAnything = function ( value ){};
		
	Constraint_isAnything.prototype.evaluate = function( ) {
		return true;
	};

	/** CONSTRAINT GREATER_THAN **/
	var Constraint_greaterThan = function ( value ){
		this.value = value;
	};
		
	Constraint_greaterThan.prototype.evaluate = function ( other ) {
		return other > this.value;
	};

	/** CONSTRAINT HAS_PROPERTY **/
	var Constraint_hasProperty = function ( value ){
		this.value = value;
	};
		
	Constraint_hasProperty.prototype.evaluate = function ( other ) {
		return	other.hasOwnProperty( this.value ) ? true : false;
	};

	/** CONSTRAINT IS_IDENTICAL_TO **/
	var Constraint_isIdenticalTo = function ( value ){
		this.value = value;
	};
		
	Constraint_isIdenticalTo.prototype.evaluate = function ( other, desc ) {
		var success = true,
			partial = false;
		
		if ( this.value.constructor === other.constructor ) {
			if ( this.value.constructor === Object && other.constructor === Object ) {
				/** We ned to check both ways to ensure two-objects consistency **/
				if ( Helpers.objectEquals(this.value, other ) === true && Helpers.objectEquals(other, this.value ) === true ) {
					success = true;
				}
				else {
					success = false;
				}
			}
			else if ( this.value.constructor === Array && other.constructor === Array ) {
				success = Helpers.arrayEquals(this.value, other );
			}
			else {
				if ( this.value === other ) {
					success = true;
				}
			}
			return success;
		}
		else
			return false;
	};

	/** CONSTRAINT INSTANCE_OF **/
	var Constraint_instanceOf = function ( value ){
		this.value = value;
	};
		
	Constraint_instanceOf.prototype.evaluate = function ( other ) {
		return Helpers.instanceOf( other, this.value ) ? true : false;
	};

	/** CONSTRAINT IS_TYPE **/
	var Constraint_isType = function ( value ){
		this.value = value;
	};
		
	Constraint_isType.prototype.evaluate = function ( other ) {
		return Helpers.typeOf( other ) == this.value ? true : false;
	};

	/** CONSTRAINT LESS_THAN **/
	var Constraint_lessThan = function ( value ){
		this.value = value;
	};
		
	Constraint_lessThan.prototype.evaluate = function ( other ) {
		return other < this.value;
	};

	/** CONSTRAINT LOGICAL_OR **/
	var Constraint_Or = function (){
		this.constraints = [];
	};

	Constraint_Or.prototype.setConstraints = function ( constraints ) {
		this.constraints = [];
		var i = 0;
		
		for ( i = 0, l = constraints.length; i < l; i++ ) {
			this.constraints[i] = constraints[i];
		}
	};

	Constraint_Or.prototype.evaluate = function ( other ) {
		var success = false;
			
		for ( var i in this.constraints ) {
			if ( this.constraints[i].evaluate( other ) ) {
				success = true;
				break;
			}
		}	
		return success;
	};

	/** CONSTRAINT LOGICAL_XOR **/
	var Constraint_Xor = function (){
		this.constraints = [];
	};

	Constraint_Xor.prototype.setConstraints = function ( constraints ) {
		this.constraints = [];
		var i = 0;
		
		for ( i = 0, l = constraints.length; i < l; i++ ) {
			this.constraints[i] = constraints[i];
		}
	};

	Constraint_Xor.prototype.evaluate = function ( other ) {
		var success = true,
			result,
			lastResult;
			
		for ( var i in this.constraints ) {
			result = this.constraints[i].evaluate( other );
			
			if ( result === lastResult ) {
				success = false;
				break;
			}
			lastResult = result;
		}	
		return success;
	};

	/** CONSTRAINT MATCHES_REGEXP **/
	var Constraint_matchesRegExp = function ( value ){
		this.value = value;
	};
		
	Constraint_matchesRegExp.prototype.evaluate = function ( other ) {
		var regex = new RegExp( other, 'i' );
		return regex.test(this.value);
	};

	/** CONSTRAINT STRING_CONTAINS **/
	var Constraint_stringContains = function ( value ){
		this.value = value;
	};
		
	Constraint_stringContains.prototype.evaluate = function ( other ) {
		return other.indexOf(this.value) != -1 ? true : false;
	};		
	/*** Constraints Ends ***/




	/*** Helper Methods Begin  ***/

	var Helpers = {
		/**  This Douglas Crockfoard's work - no lincese information found - hope it is okay to be used here **/
		typeOf : function ( value ) {
			var s = typeof value;
			if ( s === 'object' ) {
				if ( value ) {
					if( typeof value.length === 'number' &&
						!(value.propertyIsEnumerable('length')) && 
						typeof value.splice === 'function' ) {
							s = 'array';
					}
				}
				else {
					s = 'null';
				}
			}
			return s;
		},
		
		/** Dean Ewards instanceOf implementation **/
		instanceOf : function( object, Klass ) {
			if ( typeof Klass != "function" ) {
				throw new TypeError("Invalid 'instanceOf' operand ");
			}
			
			if ( object == null ) return false;
			
			if (object.constructor == Klass ) return true;
			if ( object instanceof Klass ) return true;
			
			switch ( Klass ) {
				case Array :
					return Object.prototype.toString.call(object) == "[object Array]";
				case Date :
					return Object.prototype.toString.call(object) == "[object Date]";
				case RegExp :
					return Object.prototype.toString.call(object) == "[object RegExp]";
				case Function :
					return typeof object == "function";
				case String :
				case Number :
				case Boolean :
					return typeof object == typeof Klass.prototype.valueOf();
				case Object :
					return true;
			}
			
			return false;
		},
		
		objectEquals : function ( objectf, objects ) {
			for ( var p in objectf ) {
				if( typeof objects[p] == 'undefined' ) return false;
			}
			
			for ( var p in objectf ) {
				if ( objectf[p] ) {
					switch ( objectf[p].constructor ) {
						case Object :
							if ( Helpers.objectEquals( objectf, objects ) != true ) {
								return false;
							}
							break;
						case Function : 
							if ( typeof objects[p] === 'undefined' || ( objectf[p].toString() != objects[p].toString() ) ) {
								return false;
							}
							break;
						case Array :
							if ( Helpers.arrayEquals( objectf[p], objects[p] ) == false ) {
								return false;
							}
							break;
						default :
							if ( objectf[p] !== objects[p] ) {
								return false;					
							}
					}
				}
				else {
					if ( objects[p] )
						return false;
				}
			}
			
			for ( var p in objects ) {
				if ( typeof objects[p] === 'undefined' ) return false;
			}
			
			return true;
		},
		
		arrayEquals : function ( arrf, arrs ) {
			if ( arrf.length != arrs.length ) {
				return false;
			}
			else {
				for ( var i =0, l = arrf.length; i < l; i++ ) {
					switch ( arrf[i].constructor ) {
						case Object :
							partial = Helpers.objectEquals(arrf[i], arrs[i] )
							if ( partial == false ) {
								return false;
							}
							break;
						case Array :
							if ( Helpers.arrayEquals( arrf[i], arrs[i] ) == false ) {
								return false;
							}
							break;
						default :
							if ( arrf[i] !== arrs[i] ) {
								return false
							}
					}
				}
			}
			
			return true;
		},

		hasKey : function( object, key ) {
			if ( object.hasOwnProperty(key) ) {
				return true;
			}
			return false;
		}
	};
	/*** Helper Methods End ***/

	/*** Expose Dash Begins ***/

	if(!window.Dash) {
		window.Dash = Dash;
	}
	/*** Expose Dash Ends ***/
})(window);