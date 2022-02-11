# Belter

Creating a simpler and easier language out of JavaScript.

### What's in the repo

#### Preprocessor

Right now we only have Belter for JavaScript clients running in the browser. 

The plan is also to have a version that runs in Node apps.

#### Verbs

<a href="https://github.com/scripting/Belter/blob/main/verbs.js">verbs.js</a> includes string and date verbs from Drummer, these become attached to the Belter language, and the set will grow over time. They are functions that work in both the client and server environment. 

The intention is then to have packages of verbs for each of the environment, for example file system verbs that run in the server environment and DOM verbs for browser-based Belter apps. 

The goal is to have as much common code as possible, but also providing scriptability for each.

Also some networking functions, such as GitHub and Twitter verbs will run in both places, but require different implementations. But there will be a single interface for scripts to hide the differences in the platforms as much as possible.

#### Example app -- an outliner

This is a place to type in test scripts, in the left panel, and in the right panel you'll see the code tree Belter generates. Here's the <a href="https://github.com/scripting/Belter/tree/main/examples/outliner">code</a>. <a href="http://scripting.com/images/2022/02/10/belterOutlinerScreen.png">Screen shot</a>.

#### The server for the example app

There is a <a href="https://github.com/scripting/Belter/tree/main/server">server app</a> for the outliner, just needed for testing asynchronous calling. 

It's conceivable that at some point in the future it will also serve as a testbed for the server version of Belter. 

#### Acorn and Escodegen

The preprocessor begins by compiling the user's script into a code tree using <a href="https://github.com/acornjs/acorn">Acorn</a>.

Then we make changes to the code tree.

And generate the JavaScript text by decompiling the modified code tree using <a href="https://github.com/estools/escodegen">Escodegen.</a>

There are <a href="http://scripting.com/code/belter/acorn.js">copies</a> of the client versions of <a href="http://scripting.com/code/belter/escodegen.browser.js">both</a> in the main folder for Belter, you can see they are included in the head section of the example outliner. 

### Using the outliner

The outliner can run scripts two ways:

1. Create a top-level headline with the name of the script. Underneath, the body of the script. Click the Run button. The value generated by the script,l or an error message appears to the right of the Run button. The second outline panel displays the generated code tree. 

2. It can also run one-line scripts. Type the text of the script anywhere and press Cmd-/. The value is inserted as an outline comment to the right of the one-liner. It can display JavaScript objects. 

The outliner is a good tool for exploring how the code generator for JavaScript works. 

### If you want to try it out

<a href="https://github.com/scripting/Belter/archive/refs/heads/main.zip">Download</a> the project folder. 

In the server sub-folder: <code>npm install</code>

Run the server app: <code>node belter.js</code>

config.json should work without editing. We don't do anything with identity at this time, so you don't need to set up the access token for Twitter. 

</code>In the browser open <code>localhost:1444</code>

The editor should open in the browser. 

Look at the <a href="http://scripting.com/images/2022/02/10/belterOutlinerScreen.png">screen shot</a> for ideas.

There will be more docs. ;-)

