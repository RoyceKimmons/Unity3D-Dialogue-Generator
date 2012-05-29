// Copyright 2010 Royce Kimmons | royce@kimmonsdesign.com
// Released under Creative Commons Attribution 3.0 License
// http://creativecommons.org/licenses/by/3.0/

@CustomEditor (DialogueInstance)
class DialogueInstanceEditor extends Editor {

var style : GUIStyle = new GUIStyle();

function OnInspectorGUI () {
	style.wordWrap = true;
	target.phase = GUILayout.Toolbar(target.phase,["Inspector","Editor"]);
	switch (target.phase) {
	case 0:
	DrawDefaultInspector();
	break;
	case 1:
	if (!target.dialogueSkin) GUILayout.Box("Be sure to set the skin in the inspector before previewing!");
	ShowHistory();
	ShowEntryEditor(target.curItem);
	break;
	}
	GUILayout.Label("Dialogue Generator Copyright 2010, Royce Kimmons");
	if (GUI.changed)
		EditorUtility.SetDirty (target);
}

function ShowEntryEditor (i:int) {
	var dialogue = target.dialogue;
	GUILayout.BeginVertical("box");
	dialogue[i].name=EditorGUILayout.TextField(dialogue[i].name);
	GUILayout.BeginHorizontal();
	GUILayout.Box(""+i);
	dialogue[i].longText=EditorGUILayout.TextArea(dialogue[i].longText,style,GUILayout.Height(80));
	GUILayout.EndHorizontal();
	GUILayout.BeginHorizontal();
	GUILayout.Label("Narration:",GUILayout.Width(60));
	GUILayout.BeginVertical();
	if (!target.defaultAudio) {
		GUILayout.Box("You must select a valid Default Audio Clip in the inspector before adding narration items.");
	} else {
	if (dialogue[i].narration) {
	var k : int = 0;
	for (var n in dialogue[i].narration) {
		GUILayout.BeginHorizontal();
		GUILayout.Box(""+k);
		dialogue[i].narration[k] = EditorGUILayout.ObjectField(dialogue[i].narration[k],AudioClip,true);
		if (GUILayout.Button("X",GUILayout.Width(20))) DeleteClip(i,k);
		GUILayout.EndHorizontal();
		k++;
	}
	}
	if (GUILayout.Button("Add a Clip")) AddClip(i);
	}
	GUILayout.EndVertical();
	GUILayout.EndHorizontal();
	GUILayout.BeginHorizontal();
	GUILayout.Label("Display:",GUILayout.Width(60));
	dialogue[i].pos = GUILayout.Toolbar(dialogue[i].pos,["Top","Bottom","Middle"],GUILayout.Width(180));
	GUILayout.Space(20);
	GUILayout.Label("Image:",GUILayout.Width(60));
	dialogue[i].img=EditorGUILayout.ObjectField(dialogue[i].img,Texture2D,true);
	dialogue[i].align = GUILayout.Toolbar(dialogue[i].align,["L","R"]);
	GUILayout.EndHorizontal();
	GUILayout.BeginHorizontal();
	GUILayout.Label("Mode:",GUILayout.Width(60));
	dialogue[i].mode= GUILayout.Toolbar(dialogue[i].mode,["Continue","Choice","Password","Script","End"]);
	GUILayout.EndHorizontal();
	switch (dialogue[i].mode) {
	case 0:
	GUILayout.BeginHorizontal();
	GUILayout.Label("Next:", GUILayout.Width(60));
		dialogue[i].next = EditorGUILayout.Popup(dialogue[i].next,MakeTexts());	
		if (GUILayout.Button("+",GUILayout.Width(20))) {
			AddDialogueEntry();
			dialogue[i].next = dialogue.length;
		}
		if (GUILayout.Button("->",GUILayout.Width(24))) GoTo(dialogue[i].next);
	GUILayout.EndHorizontal();
	break;
	case 1:
	GUILayout.BeginHorizontal();
	GUILayout.Label("Display:",GUILayout.Width(60));
	dialogue[i].choiceMode = GUILayout.Toolbar(dialogue[i].choiceMode,["Normal","Wheel"]);
	GUILayout.EndHorizontal();
	GUILayout.BeginHorizontal();
	GUILayout.Label("Choices:",GUILayout.Width(60));
	GUILayout.BeginVertical();
	if (dialogue[i].choices) {
		var j : int = 0;
		for (var c in dialogue[i].choices) {
			GUILayout.BeginHorizontal();
			GUILayout.Box(""+j);
			c.shortText = GUILayout.TextField(c.shortText,GUILayout.Width(120));
			GUILayout.Label("->",GUILayout.Width(16));
			c.next = EditorGUILayout.Popup(c.next,MakeTexts());			
			if (GUILayout.Button("+",GUILayout.Width(20))) {
			AddDialogueEntry();
			c.next = dialogue.length;
			}
			if (GUILayout.Button("X",GUILayout.Width(20))) DeleteChoice(i,j);
			if (GUILayout.Button("->",GUILayout.Width(24))) GoTo(c.next);
			j++;
			GUILayout.EndHorizontal();
		}
	}
	if (GUILayout.Button("Add Choice")) AddChoice(i);

	GUILayout.EndVertical();
	GUILayout.EndHorizontal();
	break;
	case 2:
	GUILayout.BeginHorizontal();
	GUILayout.Label("Choices:",GUILayout.Width(60));
	GUILayout.BeginVertical();
	if (dialogue[i].passwords) {
		j = 0;
		for (var p in dialogue[i].passwords) {
			GUILayout.BeginHorizontal();
			GUILayout.Box(""+j);
			p.shortText = GUILayout.TextField(p.shortText,GUILayout.Width(120));
			GUILayout.Label("->",GUILayout.Width(16));
			p.next = EditorGUILayout.Popup(p.next,MakeTexts());	
			if (GUILayout.Button("+",GUILayout.Width(20))) {
			AddDialogueEntry();
			p.next = dialogue.length;
			}
			if (GUILayout.Button("X",GUILayout.Width(20))) DeletePassword(i,j);
			if (GUILayout.Button("->",GUILayout.Width(24))) GoTo(p.next);
			GUILayout.EndHorizontal();
			j++;
		}
			GUILayout.BeginHorizontal();
			GUILayout.Space(110);
			GUILayout.Label("else",GUILayout.Width(30));
			GUILayout.Label("->",GUILayout.Width(16));
			dialogue[i].incorrect = EditorGUILayout.Popup(dialogue[i].incorrect,MakeTexts());	
			if (GUILayout.Button("+",GUILayout.Width(20))) {
			AddDialogueEntry();
			dialogue[i].incorrect = dialogue.length;
			}
			if (GUILayout.Button("->",GUILayout.Width(24))) GoTo(dialogue[i].incorrect);
			GUILayout.EndHorizontal();
			GUILayout.BeginHorizontal();
			dialogue[i].exit.shortText = GUILayout.TextField(dialogue[i].exit.shortText);
			GUILayout.Label("exit",GUILayout.Width(30));
			GUILayout.Label("->",GUILayout.Width(16));
			dialogue[i].exit.next = EditorGUILayout.Popup(dialogue[i].exit.next,MakeTexts());	
			if (GUILayout.Button("+",GUILayout.Width(20))) {
			AddDialogueEntry();
			dialogue[i].exit.next = dialogue.length;
			}
			if (GUILayout.Button("->",GUILayout.Width(24))) GoTo(dialogue[i].exit.next);
			GUILayout.EndHorizontal();
	}
	if (GUILayout.Button("Add Password")) AddPassword(i);
	GUILayout.EndVertical();
	GUILayout.EndHorizontal();
	break;
	case 3:
	GUILayout.Box("This script will run after the user clicks the next button.  Use the 'd' variable to access dialogue variables like bools, strings, and ints.  Each dialogue variable has 4 premade values.  If you need more, you will need to add them in the inspector (or programmatically).");
	GUILayout.BeginHorizontal();
	GUILayout.Label("Script: ",GUILayout.Width(60));
	dialogue[i].script=EditorGUILayout.TextArea(dialogue[i].script,style,GUILayout.Height(80));
	GUILayout.EndHorizontal();
	GUILayout.BeginHorizontal();
	GUILayout.Label("Navigate to:",GUILayout.Width(70));
	target.jumpto = EditorGUILayout.Popup(target.jumpto,MakeTexts());
	if (GUILayout.Button("->",GUILayout.Width(30))) GoTo(target.jumpto);
	GUILayout.EndHorizontal();
	break;
	}
	GUILayout.EndVertical();
}


function AddLink(i:int) {
var dialogue = target.dialogue;
	var arr : Array;
	if (dialogue[i].links) {
	arr = new Array(dialogue[i].links);
	} else {
	arr = new Array();
	}
	arr.Add(Link());
	dialogue[i].links = arr.ToBuiltin(Link);	
}

function AddChoice(i:int) {
var dialogue = target.dialogue;
	var arr : Array;
	if (dialogue[i].choices) {
	arr = new Array(dialogue[i].choices);
	} else {
	arr = new Array();
	}
	arr.Add(DialogueChoice());
	dialogue[i].choices = arr.ToBuiltin(DialogueChoice);
}

function AddPassword(i:int) {
var dialogue = target.dialogue;
	var arr : Array;
	if (dialogue[i].passwords) {
	arr = new Array(dialogue[i].passwords);
	} else {
	arr = new Array();
	}
	arr.Add(DialogueChoice());
	if (arr.length<=6) dialogue[i].passwords = arr.ToBuiltin(DialogueChoice);
}

function DeleteLink (i:int,j:int) {
var dialogue = target.dialogue;
	var arr : Array = new Array(dialogue[i].links);
	arr.RemoveAt(j);
	dialogue[i].links = arr.ToBuiltin(Link);
}

function DeleteChoice (i:int,j:int) {
	var dialogue = target.dialogue;
	var arr : Array = new Array(dialogue[i].choices);
	arr.RemoveAt(j);
	dialogue[i].choices = arr.ToBuiltin(DialogueChoice);
}

function DeletePassword (i:int,j:int) {
var dialogue = target.dialogue;
	var arr : Array = new Array(dialogue[i].passwords);
	arr.RemoveAt(j);
	dialogue[i].passwords = arr.ToBuiltin(DialogueChoice);
}

function MakeTexts () {
var dialogue = target.dialogue;
	var s : String[];
	var arr : Array = new Array();
	if (dialogue) {
	var i = 0;
	for (var d in dialogue) {
		if (d.longText.length>40) {
		 arr.Add("["+i+"] "+d.longText.Substring(0,40)+"...");
		} else {
		 arr.Add("["+i+"] "+d.longText);
		}
		i++;
	}
	}
	s = arr.ToBuiltin(String);
	titles = s;
	return titles;
}

function ShowEntryChildren(i:int) {
var dialogue = target.dialogue;
if (dialogue[i].choices) {
if (dialogue[i].choices.length>0) {
	for (var c in dialogue[i].choices) {
		GUILayout.BeginHorizontal();
		GUILayout.Space(50);
		ShowEntryEditor(c.next);
		if (GUILayout.Button("->",GUILayout.Width(40))) GoTo(c.next);
		GUILayout.EndHorizontal();
	}
	}
	}
}

function CollapseAll () {
var dialogue = target.dialogue;
for (var d in dialogue) {
	d.editor = false;
}
}

function ExpandAll() {
var dialogue = target.dialogue;
for (var d in dialogue) {
	d.editor = true;
}
}

function GoBack () {
var dialogue = target.dialogue;
	target.curItem = target.history[target.history.length-1];
	var arr : Array = new Array(target.history);
	arr.Pop();
	target.history = arr.ToBuiltin(int);
	print (target.history);
}

function GoTo (i:int) {
var dialogue = target.dialogue;
var arr : Array = new Array();
	if (target.history) {
		arr = new Array(target.history);
	}
	arr.Add(target.curItem);
	target.history = arr.ToBuiltin(int);
	target.curItem = i;

}

function AddDialogueEntry () {
var dialogue = target.dialogue;
	var arr : Array = new Array();
	if (target.dialogue) {
	if (target.dialogue.length>0) {
		arr = new Array(target.dialogue);
		}
	}
	arr.Add(new DialogueEntry());
	target.dialogue = arr.ToBuiltin(DialogueEntry);
}

function ShowHistory() {
var dialogue = target.dialogue;
GUILayout.BeginHorizontal();
if (target.history) {
if (target.history.length>0) {
	var i = target.history[target.history.length-1];
	var t = target.dialogue[i].longText;
	if (t.length>40) t = t.Substring(0,40)+"...";
	if (GUILayout.Button("<- ["+i+"] "+t,GUILayout.Width(Screen.width-140))) GoBack();
	}
}
if (target.curItem!=0) if (GUILayout.Button("Return to Start")) {
	RestartHistory();
	}
GUILayout.EndHorizontal();
}

function RestartHistory () {
var dialogue = target.dialogue;
	target.curItem = 0;
	var arr : Array = new Array();
	target.history = arr.ToBuiltin(int);
}

function AddClip (i:int) {
	var dialogue = target.dialogue;
	var arr : Array = new Array(dialogue[i].narration);
	if (target.defaultAudio) {
		arr.Add(target.defaultAudio);
	}
	dialogue[i].narration = arr.ToBuiltin(AudioClip);
}

function DeleteClip (i:int, j:int) {
	print (""+i+" "+j);
	var dialogue = target.dialogue;
	var arr : Array = new Array(dialogue[i].narration);
	arr.RemoveAt(j);
	dialogue[i].narration = arr.ToBuiltin(AudioClip);
}
}
