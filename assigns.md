
#Assignment 1: Dots
Key Concepts: painting, moving, internal states, defining commands, repeating commands, output

## Run-up

Welcome to Kiln-- a single-page web-app that implements the bare-bones programming language Clay. There are only three *types of things* in this language:
- *primitive commands*, which trigger direct actions in the system
- *meta commands*, which perform system-level actions like resetting, checking states, etc.
- and *user commands*, which we ourselves build by combining one or more *primitive commands*.

### But wait, what are we "commanding" here"?
Like any programming language, we're "commanding" the computer.
The commands make up the *language* we use to tell the computer what it should do.

### But what are we trying to get the computer to do?
In Kiln, the commands are all structured around *painting* abstract, non-representational art.
Mostly a bunch of dots.


## Exploration

Check it out, here's the most basic *primitive command* in Kiln: `paint`.

```
paint
```

We commanded `paint`. The system took that word-- that *symbol* composed of that exact combination of letters in that exact order-- and checked it against an internal table of possible commands. It found a *primitive command* for `paint` and got to work changing a bunch of pixels in the shape of a circle on the canvas from black to white.

### So, neat. We made a dot. ... And?

More DOTS! But wait, if we command `paint` again...

```
paint
```

### Exact
Nothing happens? Or maybe the *exact same thing* happened!
Any computing system only does *exactly* what we tell it to-- we told it to `paint` again.
What we didn't do was change *where* we wanted to paint.

So let's try a different command, `move`.

```
move
```

... Did anything happen? It didn't throw up an error, but we didn't see any outward change.

Let's try painting again.

```
paint
```

Aha! Looks like that `move` DID to something-- it changed where the system was prepared to paint, from the center (the default location) to a random position elsewhere on the canvas.

### Internal states
We didn't see any change here, but we saw that the system did change something behind the scenes.
We can check out what's happening by using, we can use the *meta command* `-state` to check what's going on under thee hood.

```
-state
```
We can see that this command outputs something into Kiln's running log.
Note the X and Y coordinates-- these indicate where the center of the dot will appear if we call `paint` right now.

Let's change that by running `move` and then calling `-state` again.
```
move
-state
```

Heyyy, look at that, the coordinates changed!
Try it a few more times and watch the values change.
```
move
-state
move
-state
move
-state
```

This gives us a way to check what's going on inside the system when nothing is obviously happening on the surface.
We won't need this *all* the time, but it's good to know how to check when something isn't working quite like we expected!

### Multiple Commands

So, we've learned how to paint a circle, and how to move to a new location.
What if we want to just do both of those at once?
We run any number of commands in a row, processed left-to-right.
```
move paint
```
This lets us bundle up multiple commands into a single line!
Let's do it a few more times.
```
move paint
move paint
move paint
move paint
```


### Building User Commands
Building on the ability to combine commands into a single line, we can ALSO combine them into a NEW command to use repeatedly later!

To define a *new* command-- a *user command*-- we use this format:
`[new command name] >> [list] [of] [primitive] [commands] [to] [run]`

Let's define the command `dot`, which will `move` the pointer, and then `paint`.
```
dot >> move paint
```

Okay, so we've defined a new command `dot`. Let's try it out.

```
dot
dot
dot
dot
```

Nice! By combining two primitives, we've made a much more useful command-- `dot` will place a random dot somewhere on the screen.

### Aside: Kiln Buttons

Also notice that the *user command* `dot` now shows up on the interface!
Kiln gives every defined command-- *primitive* or *user*-- its own *button* on the interface to help remind you what's available.
This is great for playing around and quickly testing things-- just remember that it's still all the *language* of Clay underneath.
Every button on Kiln's interface-- or ANY computer interface-- is just executing a *command* in the *language* the program is using behind the scenes.

### Repetition
So, we taught Kiln how to make randomly placed `dot`s.
If we only want to make a few dots, we can just type "dot" several times.

```
dot dot dot dot dot
```

But! What if we want to make a LOT of dots?
We can use Clay's *repetition* feature.
By putting a number *before* a command, we can tell the system to repeat it that many times.

Let's add 20 dots to this screen.
```
20dot
```

Hey! That's 20 fresh dots, all from a single command!

Let's get wild with it.
```
200dot
```

That's a lot of dots, y'all.

MORE!

```
2000dot
```

... that was too many dots.

### Aside: Exactness revisited

Notice that the command for repetition isn't `20dots`, as in the english plural.
The Clay language does NOT have a concept of "plural-S" like english does.
Trying to add that "s" will throw up an error.

```
20dots
```

That extra 's' just makes the system think the command you're asking for doesn't exist.
It knows a command called `dot`, but it's never heard of a command called `dots`.
Remember, Kiln recognizes commands by the *exact letters in an exact order*.
After all, you could have defined a completely *different* command named `dots`.



### Cleaning the Canvas, Resetting the State
Anyway, we done made a mess of dots, huh.
It's getting crowded.
Let's clean up using the `-clean` *meta command*.

```
-clean
```

Great! We've cleaned up to a fresh, blank canvas.

But, take note! We have *only* cleaned the canvas.
Everything else about Kiln is still just as it was a moment ago.

Let's check the `-state`, `-clean` the canvas again, then check the `-state` again.
```
-state
-clean
-state
```

Notice that the x/y coordinates in the state are the same before and after the `-clean` command.

To reset the system's internal state, we can use the *meta command* `-reset`.

```
-reset
```

It's important to recognize that some *meta commands* only affect an external or internal element of the Kiln system, just like with *primitive commands*

### Creating and Saving our Abstract Art

Okay, so we've got a clean canvas.
Let's make something fresh.

What would 250 dots against this fresh background look like?
```
250dot
```

Nice.
Less messy than our `2000dot`, a bit more form to look at.
Let's save it.

The `-snapshot` *meta command* tells Kiln to package up the canvas into a .png file that your browser can then download directly.
```
-snapshot
```

So there you go!
Keep this file for submission for this assignment.


### Teardown
Alright, we're all done here.

While closing the Kiln app's page will do most cleanup for us, it's good practice to *intentionally* clean your space so that you aren't surprised if something leftover sneaks into your next session!

Let's `-clean` the canvas (remembering that we already saved the output image).
```
-clean
```

And then we'll `-reset` the state of the system.
```
-reset
```

Finally, let's deal with the *user commands* we've created.

Your recent user commands are saved in your browser's *local storage*, so if you accidentally close Kiln's tab, your commands will still be there.

But! This also means that your old commands will start to accumulate and might start to clutter up the space, if they aren't useful anymore.

To avoid that sort of clutter, the `-forget` *meta command* lets us intentionally clear our user commands so we can start fresh next time.
```
-forget
```

There. It's like we were never here! We can start fresh next time.

## Recap

In this assignment, we covered the basics of giving *exact* commands to the Kiln system to produce art.
We saw how both *internal* and *external* states change in response to our commands, and how we can *bundle* commands up into new, more useful ones, which we can also *repeat* in large quantities.
Then we saw how to *save our output* and *clean up our workspace*.


## Assignment Submission

Submit the image you just generated and saved using the `-snapshot` *meta-command* to the appropriate place on blackboard.









#Assignment 2: Confetti
Combining several functions into one.
Bottom-up.
```
-forget
-reboot

paint
-state

pink
-state

paint

indigo paint
-state

cerise paint
-state

dot >> move paint

pinkdot >> pink dot
indigodot >> indigo dot
cerisedot >> cerise dot
aquadot >> aqua dot

confetti >> pinkdot indigodot cerisedot aquadot

250confetti
```

play around with the colors on your own, and pick *four* to use.
The specific color commands are:
pink, indigo, cerise, aqua, lemon, lime, ember,
white, ltgray, mdgray, dkgray, black
```
-clean
-reset
-forget



```

## bonus: use random colors

# Assignment 3: Shades
play with size and randomness,
top-down,
checking definitions

```
shades >> 200shaderandom
shaderandom >> size 2shrink shadedots
shadedots >> wd lgd mgd dgd bd
wd >> white dot
lgd >> ltgray dot
mgd >> mdgray dot
dgd >> dkgray dot
bd >> black dot
dot >> move paint
```


# Assignment 4: Vaporwave
play with transparency AND size, and more complex arrangements

```
?? vaporwave >> 3expand 6vaporshrink 3expand
?? vaporshrink >> vapor shrink
?? vapor >> 100vapordots
?? vapordots >> 4fade dots 4glow
?? dots >> dota dotb dotc
?? dota >> pink dot
?? dotb >> indigo dot
?? dotc >> aqua dot
?? dot >> move paint
```



# Assignment 5: Scribbles
```
?? scribbledegook >> 3fade farscribbles glow mfarscribbles glow mnearscribbles glow nearscribbles expand
?? farscribbles >> 4shrink 20scribble
?? mfarscribbles >> expand 8scribble
?? mnearscribbles >> expand 2scribble
?? nearscribbles >> expand scribble
?? scribble >> 100tline
?? tline >> turn line
?? line >> 5seg
?? seg >> mfwd dot
?? dot >> color paint color draw
```
