# todo: fill

In one of my projects I had to solve the problem of delayed argument initialization. The predicates (basic functions that do something with the data) could accept another predicate, primitives (actual values) or nothing. So it looks like `predicate(value)`, where `value` can be another predicate, primitive(s) or nothing.

Now, in this whole thing in the end I need to know which value(s) do I need to pass to this whole predicate list and the order in which I need to do manipulation with the value(s). So if I have `predicate1(predicate2(primitive1, predicate3(primitive2)), optionalParam)` - I need to parse it correctly and remember data to delay this functions invocation till the actual call site.


