#### 6/14/26; 2:08:36 PM by DW

Getting this root in sync with the work being done with Claude. We didn't get started off right, now doing the cleanup.

Updated versions of package.json, belter.js and package.json. I left the previous versions in place below each one, commented out. 

#### 5/31/26; 10:55:07 AM by DW

Started working on this project with Claude. 

#### 4/10/23; 11:39:31 AM by DW

How to run belter in the debugger

node --inspect-brk cli.js examples/buildblogtext.belt

#### 3/27/23; 5:25:03 PM by DW

How the docs work

We're just using DocServer app for now.

http://scripting.com/code/docserver/index.html?url=http://scripting.com/code/beltercommandline/verbdocs.opml

The verbdocs outline is below.

We also want to have commands from belter that show you docs pages

belt -docs <verbname>

#### 3/27/23; 10:23:54 AM by DW

How plugins work

Add a .js file to the plugins folder.

It's a Node.js module. It can export whatever you like.

If the name of the file is montana, you refer to the plugin as plugins.montana.

If it exports a function called helena, you call it like: plugins.montana.helena ("yo")

Plugins are loaded before your script runs. 

That's pretty much all there is to it. 

#### 3/26/23; 11:31:01 AM by DW

Add enough verbs to convert the OPML files from 2022 to text files for uploading to ChatGPT.

