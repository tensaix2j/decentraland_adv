








import resources from "src/resources";
import { NPC }    from '../node_modules/@dcl/npc-utils/index'
import { Dialog } from '../node_modules/@dcl/npc-utils/utils/types'




export class Txnpc_manager {

	public stage;
	public target_npc = -1;

	//-------------------
	constructor( stage ) {

		this.stage = stage;

	}

	//---------------------
	npc_onclick( npc_id ) {
		
		let npcb2d = this.stage.render_npcs[npc_id]["b2d"];
		if ( npcb2d != null && this.stage.is_within_distance( npcb2d , this.stage.playerb2d , this.stage.tilesize * 2 ) == 1 ) {
			
			this.target_npc = -1;
			this.stage.render_npcs[npc_id].activate() ;

		} else {
			this.target_npc = npc_id;
		}

	}

	//-----
	update() {
		
		if ( this.target_npc != -1 ) {
			let npcb2d = this.stage.render_npcs[this.target_npc]["b2d"];
			if ( npcb2d != null && this.stage.is_within_distance( npcb2d , this.stage.playerb2d , this.stage.tilesize * 2 ) == 1 ) {
				
				this.stage.render_npcs[this.target_npc].activate() ;
				this.target_npc = -1;
				
			}
		}
	}

	//---------
	end_all_npc_interactions() {
		let i ;
		for ( i = 0 ; i <  this.stage.render_npcs.length ; i++ ) {
			this.stage.render_npcs[i].endInteraction();
		}
		this.stage.conversing = false;
		
	}


	//-------------------
    create_npcs() {

    	let _this = this.stage;

    	let welcomeDialog: Dialog[] = [
    		{
    			text: 'Greeting Traveller. Stay a while and listen.'
    		},
    		{
    			text: 'Bad news! A villager reported to me that he saw Santa being kidnapped by a group of Goblins yesterday'
    		},
    		{
    			text: 'No one seems to know where they are now.'
    		},
    		{
    			text: 'Can you please help us to search and rescue Santa in order to save the Christmas for this year?'
    		},
    		{
    			text: 'Oh, i forgot that You are new here. Let me teach you some basic controls'
    		},
    		{
    			text: 'So, basically your avatar is being replaced by this guy in blue here. You control him using mouse click' 
    		},
    		{
    			text: 'To move your character around, left-click on the ground.'
    		},
    		{
    			text: 'To attack monsters, click on the target. Press E for special skill.'
    		},
    		{
    			text: 'The actual area is much larger than your viewing window can fit. When you walk around, your viewing window will pan around too.'
    		},
    		{
    			text: 'This road leads to the Town if you go South. You can purchase some goods there.'
    		},
    		{
    			text: 'To the north is unknown territory. You might find what you are looking for there.'
    		},
    		{
    			text: 'Do not take life too seriously. You will never get out of it alive.'
    		},
			{
				text: 'Have a nice day.',
				isEndOfDialog: true,
				triggeredByNext: () => {
			    	_this.conversing = false;
			    }
			},
		]

		let myNPC = new NPC(
		    { 
		    	position: new Vector3( 0, -999, 0),
		    	scale: new Vector3(0.15,0.15,0.15)
		    }, 
		    'models/knight.glb', 
		    () => {
		    	// On activate 
		    	_this.conversing = true;
		    	_this.cmd_stopmoving = 1;

		    	myNPC.talk(welcomeDialog, 0);
		    },
		    {
				idleAnim: '_idle',
				portrait: { path: 'models/knight_ui.png', offsetX: 40, height: 128, width: 128  },
			    coolDownDuration: 3,
			    hoverText: 'CHAT',
			    onlyClickTrigger: true,
			    continueOnWalkAway: true,
			    onWalkAway: () => {
				
				},
			}
		)
		myNPC.getComponent(Transform).rotation.eulerAngles = new Vector3(0, -180, 0 );
		myNPC.getComponent( GLTFShape ).withCollisions = false;
		
		


		myNPC.setParent(_this);
		myNPC["virtualPosition"] = new Vector3(0,  0.5 , 1 * _this.tilesize);
		let npcb2d = _this.createStaticCircle(	
			myNPC["virtualPosition"].x,  
			myNPC["virtualPosition"].z,  
			_this.tilesize / 8 , 
			_this.world
		);
		
		_this.render_npcs.push( myNPC );








		//-------------------------------------------------------------





		let myNPC2 = new NPC(
		    { 
		    	position: new Vector3( 0, -999, 0),
		    	scale: new Vector3(0.15,0.15,0.15)
		    }, 
		    'models/giant.glb', 
		    () => {
		    	// On activate 
		    	_this.conversing = true;
		    	myNPC2.talk([
		    		
		    		{
		    			text: 'All the things I really like to do are either immoral, illegal or fattening.'
		    		},
		    		
		    		{
						text: 'Care to have a look at what i have to offer in my store?',
						isQuestion: true,
						buttons:[
							{ 
								label: 'Yes',	
								goToDialog: 2,

								triggeredActions:  () => {
									// NPC waves goodbye
									_this.inv_and_stats.visit_shop(0);
									_this.conversing = false;
									myNPC2.endInteraction();

								},
							},
							{
								label: 'No', 
								goToDialog: 2
							},
						]
					},

					{
						//Dialog 2
						text: 'Ok, See You Later',
						isEndOfDialog: true,
						triggeredByNext: () => {
							_this.conversing = false;
						}
					}
						
					 
				], 0);
		    },
		    {
				idleAnim: 'Walking',
				portrait: { path: 'models/giant_ui.png', offsetX: 40, height: 128, width: 128  },
			    coolDownDuration: 3,
			    hoverText: 'CHAT',
			    onlyClickTrigger: true,
			    continueOnWalkAway: true,
			    onWalkAway: () => {
				
				},
			}
		)
		myNPC2.getComponent(Transform).rotation.eulerAngles = new Vector3(0, 90, 0 );
		myNPC2.getComponent( GLTFShape ).withCollisions = false;
		
		myNPC2.setParent(_this);
		myNPC2["virtualPosition"] = new Vector3(-3 * _this.tilesize , 0.6   , -11 * _this.tilesize );
		_this.createStaticCircle(	
			myNPC2["virtualPosition"].x,  
			myNPC2["virtualPosition"].z,  
			_this.tilesize / 8 , 
			_this.world
		);
		_this.render_npcs.push( myNPC2 );








		//-------------------------------------------------------------


		let myNPC3 = new NPC(
		    { 
		    	position: new Vector3( 0, -999, 0),
		    	scale: new Vector3(0.15,0.15,0.15)
		    }, 
		    'models/wizard.glb', 
		    () => {
		    	// On activate 
		    	_this.conversing = true;
		    	myNPC3.talk([
		    		{
		    			text:'People say nothing is impossible, but I do nothing every day'
		    		},
		    		{
						text: 'Wanna Buy Some Potions?',
						isQuestion: true,
						buttons:[
							{ 
								label: 'Yes',	
								goToDialog: 2,
								triggeredActions:  () => {
									// NPC waves goodbye
									_this.inv_and_stats.visit_shop(1);
									_this.conversing = false;
									myNPC3.endInteraction();

								}
							},
							{
								label: 'No', 
								goToDialog: 2
							},
						]
					},

					{
						//Dialog 2
						text: 'Have a good day.',
						isEndOfDialog: true,
						triggeredByNext: () => {
							_this.conversing = false;
						}
					}


				], 0);
		    },
		    {
				idleAnim: '_idle',
				portrait: { path: 'models/wizard_ui.png', offsetX: 40, height: 128, width: 128  },
			    coolDownDuration: 3,
			    hoverText: 'CHAT',
			    onlyClickTrigger: true,
			    continueOnWalkAway: true,
			    onWalkAway: () => {
				
				},
			}
		)
		myNPC3.getComponent(Transform).rotation.eulerAngles = new Vector3(0, -90, 0 );
		myNPC3.getComponent( GLTFShape ).withCollisions = false;
		myNPC3.setParent(_this);
		myNPC3["virtualPosition"] = new Vector3( 3 * _this.tilesize , 0.6   , -11 * _this.tilesize );
		_this.createStaticCircle(	
			myNPC3["virtualPosition"].x,  
			myNPC3["virtualPosition"].z,  
			_this.tilesize / 8 , 
			_this.world
		);
		_this.render_npcs.push( myNPC3 );





		//-------------------------------------------------------------


		let myNPC4 = new NPC(
		    { 
		    	position: new Vector3( 0, -999, 0),
		    	scale: new Vector3(0.15,0.15,0.15)
		    }, 
		    'models/archer.glb', 
		    () => {
		    	// On activate 
		    	_this.conversing = true;
		    	myNPC4.talk([
		    		{
		    			text: 'I shoot an arrow into the air, where it lands I do not care'
		    		},
		    		
		    		{
						text: 'Wanna Buy Some Weapons?',
						isQuestion: true,
						buttons:[
							{ 
								label: 'Yes',	
								goToDialog: 2,
								triggeredActions:  () => {
									// NPC waves goodbye
									_this.inv_and_stats.visit_shop(2);
									_this.conversing = false;
									myNPC4.endInteraction();

								}
							},
							{
								label: 'No', 
								goToDialog: 2
							},
						]
					},

					{
						//Dialog 2
						text: 'Asalavista Dude.',
						isEndOfDialog: true,
						triggeredByNext: () => {
							_this.conversing = false;
						}
					}	


				], 0);
		    },
		    {
				idleAnim: 'Walking',
				portrait: { path: 'models/archer_ui.png', offsetX: 40, height: 128, width: 128  },
			    coolDownDuration: 3,
			    hoverText: 'CHAT',
			    onlyClickTrigger: true,
			    continueOnWalkAway: true,
			    onWalkAway: () => {
				
				},
			}
		)
		myNPC4.getComponent(Transform).rotation.eulerAngles = new Vector3(0, 90, 0 );
		myNPC4.getComponent( GLTFShape ).withCollisions = false;
		myNPC4.setParent(_this);
		myNPC4["virtualPosition"] = new Vector3( -2 * _this.tilesize , 0.6   , -13 * _this.tilesize );
		_this.createStaticCircle(	
			myNPC4["virtualPosition"].x,  
			myNPC4["virtualPosition"].z,  
			_this.tilesize / 8 , 
			_this.world
		);
		_this.render_npcs.push( myNPC4 );




		//----


		//-------------------------------------------------------------
		let npc5_dialog_quest_not_done = [
    		{
    			text: 'You SHALL NOT PASS.',
    		},
    		{
    			text: 'Before you enter the dungeon, Please make sure you are strong enough.'
    		},
    		{
    			text: 'To prove that you are Strong enough, get me 2 items. The Bone of The Giant Skeleton and The Eye of the Goblin King'
    		},
    		{
    			text: 'Giant Skeleton is at the cemetery of South-West (-40,-40)'
    		},
    		{
    			text: 'Goblin King on the other hand is at the Goblin Village (20,-40)'
    		},
    		{
				//Dialog 2
				text: 'Alright, Get Lost now.',
				isEndOfDialog: true,
				triggeredByNext: () => {
					_this.conversing = false;
				}
			}
		];
		
		let npc5_dialog_quest_done = [
			{
				text: 'Wow , you impressed me.! '
			},
			{
				text: 'Alright, i shall get lost then',
				isEndOfDialog: true,
				triggeredByNext: () => {

					this.remove_questitems(1);
					engine.removeEntity( myNPC5 );
					_this.world.DestroyBody( myNPC5["b2d"] );
					_this.conversing = false;
					
				}
			}
		]


		let myNPC5 = new NPC(
		    { 
		    	position: new Vector3( 0, -999, 0),
		    	scale: new Vector3(0.15,0.15,0.15)
		    }, 
		    'models/knight.glb', 
		    () => {
		    	// On activate 
		    	_this.conversing = true;
		    	if ( this.check_inventory_for_required_item(1) == 1 ) {
		    		myNPC5.talk(npc5_dialog_quest_done , 0);
		    	} else {
		    		myNPC5.talk(npc5_dialog_quest_not_done , 0);
		    	}
		    },
		    {
				idleAnim: '_idle',
				portrait: { path: 'models/knight_ui.png', offsetX: 40, height: 128, width: 128  },
			    coolDownDuration: 3,
			    hoverText: 'CHAT',
			    onlyClickTrigger: true,
			    continueOnWalkAway: true,
			    onWalkAway: () => {
				
				},
			}
		)
		myNPC5.getComponent(Transform).rotation.eulerAngles = new Vector3(0, 180, 0 );
		myNPC5.getComponent( GLTFShape ).withCollisions = false;
		myNPC5.setParent(_this);
		myNPC5["virtualPosition"] = new Vector3( 20 * _this.tilesize , 0.6   , 30 * _this.tilesize );
		let myNPC5_b2d = _this.createStaticBox(	
			myNPC5["virtualPosition"].x,  
			myNPC5["virtualPosition"].z,  
			_this.tilesize ,
			_this.tilesize ,
			_this.world
		);
		myNPC5["b2d"] = myNPC5_b2d;
		_this.render_npcs.push( myNPC5 );

    






		let npc6_dialog_quest_not_done = [
			{
				text: '~~HELP~... I m poisoned... You need to kill the boss and get the Antidote.',
				isEndOfDialog: true,
				triggeredByNext: () => {
					_this.conversing = false;
				}
			}
		]


		let npc6_dialog_quest_done = [
			{
				text: 'Yo.Thanks For Saving Me... '
			},
			{
				text: 'Thats it.. '
			},
			{
				text: 'Well What do you expect... Dramatic ending ? Nope..Not enough time for that shit lol.. '
			},
			{
				text: 'Congrats!',
				isEndOfDialog: true,
				triggeredByNext: () => {

					this.remove_questitems(2);
					engine.removeEntity( myNPC6 );
					_this.world.DestroyBody( myNPC6["b2d"] );
					_this.conversing = false;

					_this.sounds["endgame"].playOnce();
					_this.inv_and_stats.submitHighscores();
						
				}
			}
		]


		let myNPC6 = new NPC(
		    { 
		    	position: new Vector3( 0, -999, 0),
		    	scale: new Vector3( 0.8, 0.8, 0.8)
		    }, 
		    'models/santa.glb', 
		    () => {
		    	// On activate 
		    	_this.conversing = true;
		    	if ( this.check_inventory_for_required_item(2) == 1 ) {
		    		myNPC6.talk(npc6_dialog_quest_done , 0);
		    	} else {
		    		myNPC6.talk(npc6_dialog_quest_not_done , 0);
		    	}
		    },
		    {
				idleAnim: '_idle',
				portrait: { path: 'models/santa_ui.png', offsetX: 40, height: 128, width: 128  },
			    coolDownDuration: 3,
			    hoverText: 'CHAT',
			    onlyClickTrigger: true,
			    continueOnWalkAway: true,
			    onWalkAway: () => {
				
				},
			}
		)
		myNPC6.getComponent(Transform).rotation.eulerAngles = new Vector3(0, 180, 0 );
		myNPC6.getComponent( GLTFShape ).withCollisions = false;
		myNPC6.setParent(_this);
		myNPC6["virtualPosition"] = new Vector3( 20 * _this.tilesize , 0.35   , 71 * _this.tilesize );
		
		myNPC6["b2d"] = _this.createStaticCircle(	
			myNPC2["virtualPosition"].x,  
			myNPC2["virtualPosition"].z,  
			_this.tilesize / 8 , 
			_this.world
		);

		_this.render_npcs.push( myNPC6 );


		//-----------------



		let myNPC7 = new NPC(
		    { 
		    	position: new Vector3( 0, -999, 0),
		    	scale: new Vector3(0.15,0.15,0.15)
		    }, 
		    'models/inmate.glb', 
		    () => {
		    	// On activate 
		    	_this.conversing = true;
		    	myNPC7.talk([
		    		
		    		{
		    			text: 'I m here to take your money'
		    		},

		    		{
		    			text: 'Just kidding...I mean I am here to help you save your progress. You dont want all your efforts to go to waste upon closing the browser tab right?'
		    		},

		    		{
						text: 'Would you like to SAVE or LOAD your progress?',
						isQuestion: true,
						buttons:[
							{ 
								label: 'SAVE',	
								goToDialog: 3,
							},
							{
								label: 'LOAD', 
								goToDialog: 4,
							},
							{
								label: 'NEITHER',
								goToDialog: 5,
							},
						]
					},

					{
						text: 'Would you like to pay 5 MATIC MANA to save your current progress? Warning: It overwrites your previous saved progress',
						isQuestion: true,
						buttons:[
							{ 
								label: 'Yes',	
								goToDialog: 5,

								triggeredActions:  () => {
									// NPC waves goodbye
									myNPC7.endInteraction();
									_this.conversing = false;
									
									_this.inv_and_stats.pay_to_save();

									log("npc7 Done");
									

								},
							},
							{
								label: 'No', 
								goToDialog: 5
							},
						]
					},

		    		
		    		{
						text: 'Would you like to pay 5 MATIC MANA to load your saved progress?',
						isQuestion: true,
						buttons:[
							{ 
								label: 'Yes',	
								goToDialog: 5,

								triggeredActions:  () => {
									// NPC waves goodbye
									_this.conversing = false;
									myNPC7.endInteraction();

									_this.inv_and_stats.pay_to_load();
									log("npc7 Done");

									
								},
							},
							{
								label: 'No', 
								goToDialog: 5
							},
						]
					},
		    		
		    		

					{
						//Dialog 2
						text: 'K bye..',
						isEndOfDialog: true,
						triggeredByNext: () => {
							_this.conversing = false;
						}
					}
						
					 
				], 0);
		    },
		    {
				idleAnim: '_idle',
				portrait: { path: 'models/inmate_ui.png', offsetX: 40, height: 128, width: 128  },
			    coolDownDuration: 3,
			    hoverText: 'CHAT',
			    onlyClickTrigger: true,
			    continueOnWalkAway: true,
			    onWalkAway: () => {
				
				},
			}
		)
		myNPC7.getComponent(Transform).rotation.eulerAngles = new Vector3(0, -90, 0 );
		myNPC7.getComponent( GLTFShape ).withCollisions = false;
		
		myNPC7.setParent(_this);
		myNPC7["virtualPosition"] = new Vector3( 3 * _this.tilesize , 0.48   , -6 * _this.tilesize );
		_this.createStaticCircle(	
			myNPC7["virtualPosition"].x,  
			myNPC7["virtualPosition"].z,  
			_this.tilesize / 8 , 
			_this.world
		);
		_this.render_npcs.push( myNPC7 );




    }




    //----
    remove_questitems( quest_id ) {
    	let i;
    	let item_needed = {};
    	let key;

    	if ( quest_id == 1 ) {
			item_needed["quest_goblineye"] = 0;
			item_needed["quest_skeletonbone"] = 0;
		} else if ( quest_id == 2 ) {
			item_needed["quest_antidote"] = 0;
		}

    	for ( i = this.stage.inv_and_stats.inventories.length - 1 ; i >= 0 ; i-- ) {
    		let item = this.stage.inv_and_stats.inventories[i] ;
    		for ( key in item_needed ) {
    			if ( item[0] == key ) {
    				this.stage.inv_and_stats.inventories.splice( i , 1 );
    			}
    		}
    	}
    	this.stage.inv_and_stats.inventory_selected_slot = -1;						
		this.stage.inv_and_stats.update_inventory_2d_ui();
		this.stage.inv_and_stats.update_selected_item_ui();

    }

    //---------
    check_inventory_for_required_item( quest_id ) {
    	
    	let i;
    	let item_needed = {};
    	let key;

		if ( quest_id == 1 ) {
			item_needed["quest_goblineye"] = 0;
			item_needed["quest_skeletonbone"] = 0;
		} else if ( quest_id == 2 ) {
			item_needed["quest_antidote"] = 0;
		}


		let inv_indexes = [];
    	for ( i = 0 ; i < this.stage.inv_and_stats.inventories.length ; i++ ) {
    		let item = this.stage.inv_and_stats.inventories[i] ;
    		for ( key in item_needed ) {
    			if ( item[0] == key ) {
    				item_needed[key] = i;
    				inv_indexes.push( i );
    			}
    		}
    	}

    	for ( key in item_needed ) {
			if ( item_needed[key] == 0 ) {
				return 0;
			}
		}
		return 1;
    }
}




