# Dash, a javascript testing library

Dash is small project I started while learning Javascript. Since I was used to PHPUnit, I set to create something similar, that is, not because the existing testing frameworks out there are not doing a fine job. Anyways, here it is and I might continue developing it if it shows promise.


## Basics
Dash follows the pattern for writing tests as many other (unit) testing libraries (frameworks.)
All tests are made of assertions which test a specific functionality of the software under test. If you are to test a number of related functionalities, you can group them into a test case. And if you can happen to have a number of related cases, they can grouped in suites. 
It is important to know you can "run" assertions without including them in a test case, equally, you can run tests cases without including them in test suites.

We use the following callback for displaying test results:

```javascript
var display = function ( assertionResult ) {
    if ( assertionResult === true ) {
        console.log("Passed");
    } else {
        console.log("Failed");
    }
};
```

### Assertions
Assertions form the basic part of any test. Dash assertions expect two or three arguments in general, the last one being a callback which receives the result of the assertion. It's for you to decide what to do with the result.
Here is an example:

```javascript
var bool = false;
Dash.assertTrue(bool === false, display);
```

### Test cases
A test case is a collection of related tests. It generally contains fixtures as well which are ran before and after case. Basically, you have a number of functions that contains assertions meant to test independent aspects of the software under test. The setUp and tearDown fixtures are ran before and after (respectively) every test.
And here an example:

```javascript
// We set up the case
var booleanCase = Dash.Case("Test booleans", function () {
    this.setUp = function () {
        this.boolTrue = true;
        this.boolFalse = false;
    };
    
    this.testTrue = function () {
       Dash.assertTrue( this.boolTrue === true, display );
    };
    
    this.testFalse = function () {
        Dash.assertFalse( this.boolTrue === this.boolFalse, display );
    };
    
    this.tearDown = function () {
        this.boolTrue = null;
        this.boolFalse = null;
    };
});

// We run the tes case
booleanCase.run();
```

### Test suites
A test suite, here in Dash, is simply an aggregation of test cases that will be ran together. Assume in addition to testing booleans, we want to test integers as well, we can create a separate test case for integers then integrate both cases into a test suite.
An example follows:

```javascript
/** Assume we already have a test case for integers name integerCase **
/** We are testing the correct implementation of primitive data types, all grouped in one test suite. **/

// We initialise the test suite and we can optionally add the test case directly
var typesSuite = Dash.Suite("Test primitive data types", [booleanCase, integerCase]);
// Or we can add them using the add() method
typesSuite.add( [booleanCase, integerCase] );
// Or we can add them one by one
typesSuite.add( booleanCase );
typesSuite.add( integerCase );

// Then we run the test suite.
typesSuite.run();
```

## Regression
It frequently occurs that say we have made modifications to one SUT and we are running the associated test case. Except we have other parts of the system that relies on current SUT and we have to run the associated test cases (better of they are not part of the same tes suite.)
For example, in a simple library, we made modifications to the selector engine. Now we're testing it. But the DOM manipulation part, which relies on the selector engine must be tested as well to make sure we didn't break anything. This is where regressions come in.
An example:

```javascript
var selectorTestCase = Dash.Case("Test the selector engine", function () {
    // Selector tests ...
});

var domTestCase = Dash.Case("Test the DOM manipulation functions", function () {
    // DOM tests ...
});

// Now, we configure the selector engine test case to run the dom test after it is done
selectorTestCase.configuration({
    "regressions": [domTestCase]
});

// We run the test(s)
selectorTestCase.run();
```
In one word, regressions manage dependencies between two unrelated test cases.
So don't put two unrelated test cases in the test suite just to make sure they both run together.

## Extending Dash
It will happen that you want an assertion that doesn't exist and you want one for yourself. Dash offers constraints for that.
The idea is simple: you create a constraints, then an assertion to evaluate the constraint and if you wish, add this to Dash.

This is the pattern followed internally by Dash.
> Developers: right now, while easy to extend Dash, it is not recommended to post public extensions since extensions can easily overwrite each other creating confusion. This is being looked into. But _do create your own private extensions!_

The warning aside, here the pattern for creating extensions. Assume we want an assertion to test if a number of the negated value of the other. -2 and 2 will return true, -2 and 3 will return false and 2 and 2 must return false.

**1. Create the constraint:** 
We have two types of constraints: one that accepts other constraints as arguments and the other does not. Here we illustrate for the second type. After understanding this one, it is easy to see how the first type works by inspecting the source.

The first step is to create the constructor.
```javascript
// The constructor will receive the first number which it will receive from the assertion
var Constraint_isOpposite = function ( firstNumber ) {
    this.firstNumber = firstNumber;
};
```

The second step is to create the evaluation method. This method will receive the second number which will be evaluated against the first number. The evaluation method is mandatory since is called by the `assertThat` method which exists on Dash.

```javascript
Constraint_isOpposite.prototype.evaluate = function( secondNumber ) {
    if (this.firstNumber / secondNumber == -1 )     {
        return true;
    } else {
        return false;
    }
};
```
The third step, optional is to add this constraint to Dash.
```javascript
// We have an object with our constraints
var MyConstraints = {
    isOpposite : function ( firstNumber ) {
        return new Constraint_isOpposite( firstNumber );
    }
};

// Then we add it to Dash, optionally
Dash.extend( Dash, MyConstraints);
```

Now that we have our constraint set up, we are ready to make an assertion out it.

**2. Creating the assertion:** We want to be able to use check for oppositve number just like any other assertion so we proceed to make this constraint into an assertion.

```javascript
// Again we have an object with our custom assertions
var MyAssertions = {
   assertOpposite : function ( firstNumber, secondNumber, messageCallback ) {
        // If we added the constraint on Dash, then we get from it, else we get it from our custom object or just as it. Here, we assume it is on Dash
        var constraint = Dash.isOpposite( firstNumber );
        
        // We evaluate the constraint - this is done by Dash.assertThat()
        var result = Dash.assertThat( secondNumber, constraint );
       
       // We give the callback the result of the evaluation
       messageCallback( result );
   }
};

// If so we wish, we can add this new assertion on Dash
Dash.extend( Dash, MyAssertions );
```

Now the new assertion is ready, we can use it.
*But before we continue, note that the constraint alone is enought to get result. Just call the constraint in Dash.assertThat() as done in the assertion method and you're done.*

**3. Usage:** It is this easy, well just use like any othe assertion.

```javascript
Dash.assertOpposite(2, -2, display);
```

**_And in constraints, lie the power of Dash!_**

## Conclusion
Well, that is where Dash stands for now (or I stand with regard to Dash.)
**Note that Dash is not unit tested and cannot be used to test code meant for production** but I will continue to work it slowly and if it shows potential, maybe even give it a faire short. :-)