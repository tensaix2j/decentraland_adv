
export default {
	
	models: {
		tree: new GLTFShape("models/tree.glb"),
		house: new GLTFShape("models/house.glb"),
		archer: new GLTFShape("models/archer.glb"),
		knight: new GLTFShape("models/knight.glb"),
		skeleton: new GLTFShape("models/skeleton.glb"),
		giant: new GLTFShape("models/giant.glb"),
		wizard: new GLTFShape("models/wizard.glb"),
		warrior:new GLTFShape("models/warrior.glb"),
		goblin: new GLTFShape("models/goblin.glb"),
		goblinspear: new GLTFShape("models/goblinspear.glb"),
		tombstone: new GLTFShape("models/tombstone.glb"),
		cubeblock: new GLTFShape("models/cubeblock.glb"),
		arrow: new GLTFShape("models/arrow.glb"),

		generic_box: new BoxShape()
	},


	textures: {
		floor: new Texture("models/floor.png"),
		surfacepatch: new Texture("models/surfacepatch.png"),

		inventory: new Texture("models/inventory.png"),
		emptyslot: new Texture("models/emptyslot.png"),

		selectedslot: new Texture("models/selectedslot.png"),
		equippedslot: new Texture("models/equippedslot.png"),

		eqp_bronze_sword: new Texture("models/bronzesword.png"),
		eqp_bronze_shield: new Texture("models/bronzeshield.png"),
		eqp_bronze_helmet: new Texture("models/bronzehelmet.png"),
		eqp_bronze_armor: new Texture("models/bronzearmor.png"),
		eqp_bronze_pant: new Texture("models/bronzepant.png"),
		eqp_bronze_boot: new Texture("models/bronzeboot.png"),
		
		eqp_iron_sword: new Texture("models/ironsword.png"),
		eqp_iron_shield: new Texture("models/ironshield.png"),
		eqp_iron_helmet: new Texture("models/ironhelmet.png"),
		eqp_iron_armor: new Texture("models/ironarmor.png"),
		eqp_iron_pant: new Texture("models/ironpant.png"),
		eqp_iron_boot: new Texture("models/ironboot.png"),

		potion_health: new Texture("models/healthpotion.png"),

		uiframe: new Texture("models/uiframe.png"),
		uiframesmall: new Texture("models/uiframesmall.png")

	},
	sounds: {
		whoosh: new AudioClip("sounds/whoosh.mp3"),
		explosion: new AudioClip("sounds/explosion.mp3"),
		warhorn: new AudioClip("sounds/warhorn.mp3"),
		electricshock: new AudioClip("sounds/electricshock.mp3"),
		arrowshoot: new AudioClip("sounds/arrowshoot.mp3"),
		arrowhit:new AudioClip("sounds/arrowhit.mp3"),
		swordhit:new AudioClip("sounds/swordhit.mp3"),
		organicdie: new AudioClip("sounds/organicdie.mp3"),
		skeletonhit: new AudioClip("sounds/skeletonhit.mp3"),
		punch: new AudioClip("sounds/punch.mp3"),
		destruction: new AudioClip("sounds/destruction.mp3"),
		spawn: new AudioClip("sounds/spawn.mp3"),
		endgame:new AudioClip("sounds/endgame.mp3"),
		scream:new AudioClip("sounds/scream.mp3"),
		buttonclick:new AudioClip("sounds/buttonclick.mp3"),
		denied: new AudioClip("sounds/denied.mp3"),
		horse: new AudioClip("sounds/horse.mp3"),
		gargoyle: new AudioClip("sounds/gargoyle.mp3"),
		pig: new AudioClip("sounds/pig.mp3"),
		burp:new AudioClip("sounds/burp.mp3"),
		wardrum:new AudioClip("sounds/wardrum.mp3"),
		medieval: new AudioClip("sounds/medieval.mp3"),
		growl: new AudioClip("sounds/growl.mp3"),
		goblinscream: new AudioClip("sounds/goblinscream.mp3"),
		drink:new AudioClip("sounds/drink.mp3")
	}


	
};



		









