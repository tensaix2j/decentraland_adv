








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
    			text: 'To attack monsters, hit E on the target.)'
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
    			text: 'Last but not the least, do not take life too seriously. You will never get out of it alive.'
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
				idleAnim: 'Walking',
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
				idleAnim: 'Walking',
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


    }
}

