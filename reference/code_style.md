A summary of The Art of Readable Code by Dustin Boswell and Trevor Foucher

* Overall metric for readability: code should be written to minimise the time it would take someone else to fully understand it (able to modify the code and spot bugs)
Ways to improve readability (ranked from easiest change to most time intensive)

1. Naming of variables and functions:
    * Use specific, descriptive, succinct names that say the entity's value or purpose
    * Use concrete names instead of abstract names e.g. canListenOnPort > serverCanStart
    * Add important attributes e.g. units or state e.g. unsafeUrl, safeUrl > url
    * Can use shorter variable names for smaller scope
    * Use word-formatting (e.g. camelCase, snake_case), check style guide 
    * Avoid names that can be misunderstood e.g. exclude, select > filter
    * Prefix `max`, `min` when defining upper and lower limits
    * Use `first` and `last` for inclusive/inclusive ranges 
    * Use `begin` and `end` for inclusive/exclusive ranges
    * Prefix `is/has/can/should` for boolean vars
    * Use positive rather than negated terms 
1. Aesthetics 
    * Similar code should have similar silhouettes
    * Use line breaks to segment a block of code to increase high level understanding
    * Consider using column alignment 
    * However, its more important to be consistent than to follow the "right" style
1. Commenting 
    * Overall aim: help reader know as much as the writer did 
    * But good code > bad code + good comments
    * Can be:
        * High level / "big picture" explanation of what code is doing
        * Record of your thought process when writing the code 
        * Explanation for potential "huh?" moments 
        * Director comments e.g. instructions for future code user
            * Consider using `TODO` / `FIXME` / `HACK` / `XXX` 
        * Warning for surprising behaviours
        * Example input/output of a function 
    * Avoid:
        * Unclear pronouns, *what does "it" refer to?*
        * Repeating the function definition in prose form 
        * Stating what is literally being done
1. Making control flow easier to read 
    * Order of arguments in conditionals: 
        * LHS = Expression being changed / interrogated 
        * RHS = Expression that is constant or being compared to 
    * Use ternary operations only for simple cases 
    * Use `while` loops instead of `do/while` loops
    * Avoid many layers of nesting as it becomes hard to maintain a mental image of the conditionals. Choose to refactor or return early instead 
    * Viable and different `if/else` ordering philosophies:
        * Deal with positive case first 
        * Deal with simpler case first (good to reduce LOC between `if` and `else`)
        * Deal with most relevant/interesting case first 
1. Breaking down complexity 
    * Introduce "explaining variables" to capture a subexpression (rather than use raw logic)
    * Use "summary variables" to summarise logic e.g. 
        ```
        if(request.user.id != document.owner_id) ... 
        ``` 
       changed to  
        ```
        boolean user_owns_document = request.user.id == document.owner_id
        if (user_owns_document) ...
        ```
    * Try using Demorgan's law to simplify conditionals 
    * When dealing with complex logic, sometimes approaching the inverse goal can simplify implementation
1. Remove unnecessary variables 
    * Finish a task in as few lines as possible
        * Try removing temporary variables and return early instead 
    * Minimise scope of variables so reader has fewer things to remember
        * Try passing in arguments instead 
        * Try breaking down a complex class
        * Try making methods static 
    * Prefer "write-once" variables whose values don't change too often so that it is easier to reason its value
1. Refactor; Extract unrelated subproblems from a method implementation
    * Separate generic code from project specific code 
    * Generate code can usually go into a `utils` folder / collection of helpful and frequently used methods 
    * Pros of separating logic:
        * Allows reader to focus on high level goal without being bogged down by implementation detail
        * Allows separated  functions to be reused 
        * Easier to test isolated logic 
        * Easier to identify edge cases 
1. When writing new code
    * Try rubber-ducking/turn thoughts into code: explain things in plain english, pay attention to key words used and write code that matches that description
1. Write less code 
    * Rethink requirements for a function to solve the easiest version of the problem 
    * Extract as much "utility" code as possible 
    * Modularise your code so that each subsystem is as decoupled as possible 
    * Be conscious of the weight of the project, ruthlessly prune unused code 
    * Familiarise yourself with (standard) libraries and the available methods
1. Making test code more readable 
    * Overall aim: make code written for testing more readable so others feel comfortable changing or adding new tests 
    * Extract high level implementation 
    * Print better error messages e.g. include the input, output and expected output, where applicable (some assertion libraries might have this functionality) 
    * Choose test cases that are both simple and effective in exposing potential bugs 
    * Break down these test cases into smaller ones to introduce granularity (facilitates debugging later on)
    * Pick good names e.g. Test_<functionName>_<scenario>
1. Try test-friendly development maybe?
    * Code functions that 
      * Have a well defined interface 
      * Have little to no "set up"
      * Have no hidden data to inspect 
1. Lastly...
    * Avoid 
        * Non constant global vars as they have to be reset for each test case and it is hard to determine which functions have side effects
        * Code that depends on a lot of external components as this increase amount of set-up needed for testing and increased dependency introduces  more points of failure in code 
        * Code with non-deterministic behaviour as this is difficult to test and is probably susceptible to race conditions and non-reproducible bugs 
    * Try to have 
        * Classes that have little to no internal state so there is little to no set up and is simpler to understand 
        * Classes/functions that does only one thing so that fewer tests are needed to fully test it and it is indicative of a decoupled system 
        * Classes/functions that are highly decoupled so that they can all be developed, modified and tested independently/in parallel.
        * Functions that have well defined interfaces so that what to test becomes clear and function can be easily understood and reused elsewhere

**Benefits of readable code**
 
* Easier to spot bugs 
* Easier to onboard new developers on team (or could be you revisiting the code in 6 months)
* Easier to make changes to code 
* Easier to maintain 