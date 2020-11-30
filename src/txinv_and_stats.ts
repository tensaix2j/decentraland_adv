

import resources from "src/resources";
import { Txclickable_image } from "src/txclickable_image"
import * as ui from '../node_modules/@dcl/ui-utils/index'


export class Txinv_and_stats extends Entity {

	public inventories = [];
	public inventories_uiimgs = [];
	public inventory_selected_slot = -1;
	public inventory_selected_slot_uiimg;
	public inventory_selected_item_uiimg;
	public inventory_selected_item_caption;
	public inventory_selected_item_canvas;
	public inventory_equipped_slot_uiimg = [];
	public inventory_selected_item_but_use_caption ;
	public inventory_selected_item_but_throw ;
	public inventory_selected_item_but_sell ;
					

	public shop_canvas;
	public shop_inventories = [];
	public shop_inventories_uiimgs = [];
	public shop_selected_slot = -1;
	public shop_selected_slot_uiimg;
	public shop_selected_item_uiimg;
	public shop_selected_item_caption;
	public shop_selected_item_canvas;

	public visiting_shop = 0;


	public player_stats_caption;
	public player_stats = {};
	public player_derived_stats = [0,0,0,0,0,0,0,0,0];
	public player_equipped = [];

	public player_stats_btn_grp;
	

	public shops = [
		[],   //shop1
		[],   //shop2
		[]	  //shop3
	];

	public virpos_caption;
	public stage ;
	public tick = 0;
	public tick_replenish_hp = 0;



	constructor( stage ) {
		
		super();
		this.stage = stage;
		this.init_player_stats();
		
		this.random_shop_items(0);
		this.random_shop_items(1);
		this.random_shop_items(2);

		this.create_ui_2d();
			


		this.inventories.push( [ "potion_health"    , 50 ] );
		this.inventories.push( [ "potion_health"    , 50 ] );
		


		this.update_inventory_2d_ui();
		this.update_selected_item_ui();
		this.update_shop_2d_ui();
		this.update_player_stats();

					

	}


	//-----------------------
	public armor_parts  =  ["helmet","armor","pant","boot"];
	public armor_mats   =  ["wooden","bronze","iron"];
	public weapon_parts =  ["sword"];
	public weapon_mats  =  ["wooden","bronze","iron"];

	visit_shop( shop_id ) {

		if ( this.tick > 30 * 180 ) {
			this.random_shop_items(0);
			this.random_shop_items(1);
			this.random_shop_items(2);
			this.tick = 0;
		}

		this.shop_inventories.length = 0;
			
		let i, j ;
		for ( i = 0 ; i < this.shops[shop_id].length ; i++ ) {
			this.shop_inventories.push( this.shops[shop_id][i] );
		}
		
		this.visiting_shop = 1;
		this.shop_selected_slot = 0;
		this.update_shop_2d_ui();

	}


	//----------------------------
	gen_random_armor() {
		let j;
		
		let armor_partid = this.random_int( this.armor_parts.length ); 
		let armor_part   = this.armor_parts[armor_partid] ;

			
		//let armor_matid  = this.random_int( this.armor_mats.length );
			
		let armor_matid = 0;
		let rnd = Math.random();
		if ( rnd < 0.15 ) {
			armor_matid = 2;
		} else if ( rnd < 0.5 ) {
			armor_matid = 1
		}


		let armor_mat 	 = this.armor_mats[armor_matid]; 

		let cost = armor_matid * 1000 + 500;	
		let armor_val = 1 + armor_matid;
		let dmg_val   = 0;

		let addattrs = [0,0,0,0,0,0];
		for ( j = 0 ; j < 6 ; j++ ) {
			let addattr = this.random_int(10);
			if ( addattr >= 6 ) {
				addattr -= 6;
			} else {
				addattr = 0;
			}
			addattrs[j] = addattr;
			cost += ( addattr * 200 );
		}	
		return ["eqp_" + armor_mat + "_" + armor_part , cost  , armor_val ,dmg_val   ,addattrs[0] , addattrs[1], addattrs[2], addattrs[3], addattrs[4], addattrs[5]   ]
	}


	//----------
	gen_random_weapon() { 

		let j;
		let weapon_partid = this.random_int( this.weapon_parts.length ); 
		let weapon_part   = this.weapon_parts[weapon_partid] ;
		

		//let weapon_matid  = this.random_int( this.weapon_mats.length );
		let weapon_matid = 0;
		let rnd = Math.random();
		if ( rnd < 0.15 ) {
			weapon_matid = 2;
		} else if ( rnd < 0.5 ) {
			weapon_matid = 1
		}

		let weapon_mat 	 = this.weapon_mats[weapon_matid]; 

		let cost = weapon_matid * 1000 + 500;	
		let armor_val = 0;
		let dmg_val   = 1 + weapon_matid;

		let addattrs = [0,0,0,0,0,0];
		for ( j = 0 ; j < 6 ; j++ ) {
			let addattr = this.random_int(10);
			if ( addattr >= 6 ) {
				addattr -= 6;
			} else {
				addattr = 0;
			}
			addattrs[j] = addattr;
			cost += ( addattr * 200 );
		}
		return  ["eqp_" + weapon_mat + "_" + weapon_part , cost  , armor_val ,dmg_val   ,addattrs[0] , addattrs[1], addattrs[2], addattrs[3], addattrs[4], addattrs[5]   ] 
				
	}

	//----
	gen_random_potion() {
		
		return ["potion_health", 50 ] 
	}





	//-------------------------------
	random_shop_items( shop_id ) {
		
		let i,j;
		this.shops[shop_id].length = 0 ;

		if ( shop_id == 0 ) {
			for ( i = 0 ; i < 15 ; i++ ) {

				let armor = this.gen_random_armor();
				this.shops[ shop_id ].push( armor )
			}
		} else if ( shop_id == 1 ) {
			

			for ( i = 0 ; i < 10 ; i++ ) {
				let potion = this.gen_random_potion();
				this.shops[ shop_id ].push( potion)
			}



		} else if ( shop_id == 2 ) {


			for ( i = 0 ; i < 5 ; i++ ) {
				let weapon = this.gen_random_weapon();
				this.shops[ shop_id ].push(weapon)
			}
		}
	}



	random_int( range ) {
		return ( Math.random() * range ) >> 0;
	} 


	inventory_item_onclick( id , owner ) {
		
		//log( id , owner );
		this.stage.sounds["buttonclick"].playOnce();


		if ( owner == "player" ) {
			
			this.inventory_selected_slot = id;
			this.inventory_selected_slot_uiimg.visible = true ;
			this.inventory_selected_slot_uiimg.positionX = id % 5 * 40;
			this.inventory_selected_slot_uiimg.positionY = -( id / 5 >> 0 ) * 40;
			this.update_selected_item_ui();
		
		} else if ( owner == "shop" ) {

			this.shop_selected_slot = id;
			this.shop_selected_slot_uiimg.visible = true ;
			this.shop_selected_slot_uiimg.positionX = id % 5 * 40;
			this.shop_selected_slot_uiimg.positionY = -( id / 5 >> 0 ) * 40;
			this.update_shop_2d_ui();
		

		} 
		
	}	


	//-----------
	get_equipped_position( item_type_part ) {

		let ret = ["helmet", "armor", "pant", "boot", "sword", "shield"].indexOf( item_type_part );	
		return ret;
	}

	//----
	get_attr_description( item_j ) {
		let ret = ["","","Armor", "Damage", "STR", "VIT", "DEX", "INT","MaxHP", "MaxMana"][ item_j ];
		return ret;
	}


	//-----------------
	drinkpotion() {
		this.stage.playerb2d.m_userData[8] += 50;
		if ( this.stage.playerb2d.m_userData[8] > this.stage.playerb2d.m_userData[9] ) {
			this.stage.playerb2d.m_userData[8] = this.stage.playerb2d.m_userData[9];
		}
		this.stage.sounds["drink"].playOnce();
		this.update_player_stats();
	}

	//----------
	drink_from_inventory() {
		
		let i ;
		let hasdrank = 0;

		for ( i = 0 ; i < this.inventories.length ; i++ ) {
			if ( this.inventories[i][0] == "potion_health" ) {

				hasdrank = 1;
				this.drinkpotion();
				this.inventory_selected_slot = -1;						
				this.inventories.splice( i , 1 );
				
				this.update_inventory_2d_ui();
				this.update_selected_item_ui();
				this.update_player_stats();

				break;
			}
		}
		if ( hasdrank == 0 ) {
			this.stage.sounds["denied"].playOnce();
			ui.displayAnnouncement('No HP potion in the inventory!', 5, true, Color4.Red(), 20, false);
		}
	}



	//--
	button_onclick( action ) { 
		
		log( "button_onclick" , action );

		this.stage.sounds["buttonclick"].playOnce();


		if ( action == "selected_item_use" ) {

			let item = this.inventories[ this.inventory_selected_slot ];
			let item_type =  item[0];
			let item_type_parts = item_type.split("_");

			if ( item_type_parts[0] == "potion" ) {
			
				if ( item_type_parts[1] == "health" ) {
					this.drinkpotion();
				}

				this.inventories.splice( this.inventory_selected_slot , 1 );
				this.inventory_selected_slot = -1;						
				
			} else if ( item_type_parts[0] == "eqp" ) {

				let eqp_position = this.get_equipped_position( item_type_parts[2] )
				if ( this.player_equipped[ eqp_position ] == item ) {  
					this.player_equipped[ eqp_position ] = null;
				} else {
					this.player_equipped[ eqp_position ] = item;
				}
			}

			this.update_inventory_2d_ui();
			this.update_selected_item_ui();
			this.update_player_stats();



		} else if ( action == "selected_item_throw" ) {
			
			let item =  this.inventories[ this.inventory_selected_slot ];
			let item_type =  item[0];
			let item_type_parts = item_type.split("_");
			if ( item_type_parts[0] == "eqp" ) {
				let eqp_position = this.get_equipped_position( item_type_parts[2] );
				if ( this.player_equipped[ eqp_position ] == item ) {
					this.player_equipped[ eqp_position ] = null;
				}
			}
			this.inventories.splice( this.inventory_selected_slot , 1 );
			this.inventory_selected_slot = -1;						
			this.update_inventory_2d_ui();
			this.update_selected_item_ui();
			this.update_player_stats();

			this.stage.spawn_pickables( 
				this.stage.playerb2d.GetPosition().x ,
				this.stage.playerb2d.GetPosition().y ,
				item );



		} else if ( action == "selected_item_close" ) {
			
			this.inventory_selected_slot = -1;						
			this.update_inventory_2d_ui();
			this.update_selected_item_ui();


		} else if ( action == "selected_item_sell" ) {

			let item =  this.inventories[ this.inventory_selected_slot ];
			let item_type =  item[0];
			let item_type_parts = item_type.split("_");

			if ( item_type_parts[0] == "eqp" ) {
				let eqp_position = this.get_equipped_position( item_type_parts[2] );
				if ( this.player_equipped[ eqp_position ] == item ) {
					this.player_equipped[ eqp_position ] = null;
				}
			}


			this.player_stats["money"] += ( item[1] / 4 ) >> 0;
			
			this.inventories.splice( this.inventory_selected_slot , 1 );
			this.inventory_selected_slot = -1;	

			this.update_inventory_2d_ui();
			this.update_selected_item_ui();
			this.update_player_stats();

			if ( this.shop_inventories.length < this.shop_inventories_uiimgs.length ) {
				
				this.shop_inventories.push( item );
				this.update_shop_2d_ui();
			}



		} else if ( action == "shop_close" ) {

			this.visiting_shop = 0;
			this.update_shop_2d_ui();
		




		} else if ( action == "shop_item_buy" ){

			let item = this.shop_inventories[ this.shop_selected_slot ];

			if ( this.player_stats["money"] >= item[1] ) {
				if ( this.inventories.length < this.inventories_uiimgs.length ) {
					
					this.inventories.push( item );

					this.shop_inventories.splice( this.shop_selected_slot , 1 );
					this.shop_selected_slot = -1;						
					this.player_stats["money"] -= item[1];
					

					this.update_shop_2d_ui();
					this.update_inventory_2d_ui();
					this.update_player_stats();


				} else {
					ui.displayAnnouncement('Inventory is full!', 5, true, Color4.White(), 20, false);

				}
			} else {
				ui.displayAnnouncement('Not enough money', 5, true, Color4.White(), 20, false);

			}

		} else if (action.substr(0,7) == "addstat") {

			this.player_stats["remaining_points"] -= 1;
			let attr = action.split("_")[1];
			this.player_stats[attr] += 1;
			this.update_player_stats();
		}


	}




	//----
	init_player_stats() {

		this.player_stats["level"] 		= 1;
		this.player_stats["exp"] 		= 0;
		this.player_stats["money"] 		= 500;
		this.player_stats["str"] 		= 10;
		this.player_stats["vit"] 		= 10;
		this.player_stats["dex"] 		= 10;
		this.player_stats["int"] 		= 10;
		this.player_stats["remaining_points"] = 5;

	}

	//--------
	gain_exp( exp ) {
		this.player_stats["exp"] += exp ;
		if ( this.player_stats["exp"] >= this.exp_needed[ this.player_stats["level"] - 1 ] ) {

			// log("levelup");
			this.player_stats["exp"]   = this.player_stats["exp"] % this.exp_needed[ this.player_stats["level"] - 1 ];
			this.player_stats["level"] += 1;

			ui.displayAnnouncement('LEVEL UP!', 15, true, Color4.Yellow(), 20, false);
			this.stage.sounds["levelup"].playOnce();
			this.player_stats["remaining_points"] += 5;

			this.calculate_derived_stats();	
			this.stage.playerb2d.m_userData[8] = this.stage.playerb2d.m_userData[9];
		}
		this.update_player_stats();	
		
	}

	//----
	lose_exp( ) {
		let exp_to_lose = this.exp_needed[ this.player_stats["level"] - 1 ];
		this.player_stats["exp"] -= exp_to_lose;
		if ( this.player_stats["exp"] < 0 ) {
			this.player_stats["exp"] = 0;
		}
		this.update_player_stats();	
			
	}

	
	//-----
	create_ui_2d() {

		let ui_2d_canvas = new UICanvas();
		let ui_2d_inventory = new UIImage(ui_2d_canvas, resources.textures.inventory );
		ui_2d_inventory.vAlign = "bottom";
		ui_2d_inventory.hAlign = "right";
		ui_2d_inventory.sourceWidth = 200;
		ui_2d_inventory.sourceHeight = 160;
		ui_2d_inventory.width = 200;
		ui_2d_inventory.height = 160;
		ui_2d_inventory.positionX = -10;

		let i;
		for ( i = 0 ; i < 20 ; i++ ) {
			let item_image = new Txclickable_image( ui_2d_inventory , resources.textures.emptyslot , this, i , "player" );
			this.inventories_uiimgs.push( item_image );
		}

		let ui_2d_inventory_caption = new UIText( ui_2d_inventory );
		ui_2d_inventory_caption.value = "Inventory: Click on the item to select.\nPress F to drink HP potion from inventory."
		ui_2d_inventory_caption.vAlign = "top";
		ui_2d_inventory_caption.vTextAlign = "top";
		ui_2d_inventory_caption.isPointerBlocker = false;
		ui_2d_inventory_caption.hAlign = "left";
		ui_2d_inventory_caption.positionY = 40;	



		let inventory_selected_slot_uiimg = new UIImage( ui_2d_inventory , resources.textures.selectedslot );
		inventory_selected_slot_uiimg.vAlign = "top";
		inventory_selected_slot_uiimg.hAlign = "left";
		inventory_selected_slot_uiimg.sourceWidth = 40;
		inventory_selected_slot_uiimg.sourceHeight = 40;
		inventory_selected_slot_uiimg.width = 40;
		inventory_selected_slot_uiimg.height = 40;
		inventory_selected_slot_uiimg.visible = false;
		inventory_selected_slot_uiimg.isPointerBlocker = false;
		this.inventory_selected_slot_uiimg = inventory_selected_slot_uiimg;

		for ( i = 0 ; i < 6 ; i++ ) {
			let inventory_equipped_slot_uiimg = new UIImage( ui_2d_inventory, resources.textures.equippedslot ); 
			inventory_equipped_slot_uiimg.vAlign = "top";
			inventory_equipped_slot_uiimg.hAlign = "left";
			inventory_equipped_slot_uiimg.sourceWidth = 40;
			inventory_equipped_slot_uiimg.sourceHeight = 40;
			inventory_equipped_slot_uiimg.width = 40;
    		inventory_equipped_slot_uiimg.height = 40;
    		inventory_equipped_slot_uiimg.visible = false;
    		inventory_equipped_slot_uiimg.isPointerBlocker = false;
    		this.inventory_equipped_slot_uiimg.push( inventory_equipped_slot_uiimg ) ;
		}



		let inventory_selected_item_canvas = new UIImage( ui_2d_canvas , resources.textures.uiframe);
		inventory_selected_item_canvas.vAlign = "bottom";
		inventory_selected_item_canvas.hAlign = "right";
		inventory_selected_item_canvas.sourceWidth = 1024;
		inventory_selected_item_canvas.sourceHeight = 1024;
		inventory_selected_item_canvas.width = 200;
		inventory_selected_item_canvas.height = 180;
		inventory_selected_item_canvas.positionX = -10;	
		inventory_selected_item_canvas.positionY = 200;	
		this.inventory_selected_item_canvas = inventory_selected_item_canvas;
		


		let inventory_selected_item_uiimg = new UIImage( inventory_selected_item_canvas , resources.textures.emptyslot );
		inventory_selected_item_uiimg.vAlign = "top";
		inventory_selected_item_uiimg.hAlign = "left";
		inventory_selected_item_uiimg.sourceWidth = 40;
		inventory_selected_item_uiimg.sourceHeight = 40;
		inventory_selected_item_uiimg.width = 40;
		inventory_selected_item_uiimg.height = 40;
		inventory_selected_item_uiimg.positionX = 4;	
		inventory_selected_item_uiimg.positionY = -4;	
			
		this.inventory_selected_item_uiimg = inventory_selected_item_uiimg;
		
		let inventory_selected_item_caption = new UIText( inventory_selected_item_canvas );
		inventory_selected_item_caption.vAlign = "top";
		inventory_selected_item_caption.vTextAlign = "top";
		inventory_selected_item_caption.hAlign = "left";
		inventory_selected_item_caption.positionY = -10;	
		inventory_selected_item_caption.positionX = 50;	
		inventory_selected_item_caption.isPointerBlocker = false;

		this.inventory_selected_item_caption = inventory_selected_item_caption;
		



		let inventory_selected_item_but_use = new UIImage( inventory_selected_item_canvas, resources.textures.uiframesmall );
		inventory_selected_item_but_use.vAlign = "bottom";
		inventory_selected_item_but_use.hAlign = "left";
		inventory_selected_item_but_use.sourceWidth = 64;
		inventory_selected_item_but_use.sourceHeight = 64;
		inventory_selected_item_but_use.width = 80;
		inventory_selected_item_but_use.height = 20;
		inventory_selected_item_but_use.positionX = 10;	
		inventory_selected_item_but_use.positionY = 10;	
		inventory_selected_item_but_use.onClick = new OnClick(() => {
			this.button_onclick( "selected_item_use" );
		});
		

		let inventory_selected_item_but_use_caption = new UIText( inventory_selected_item_but_use );
		inventory_selected_item_but_use_caption.value = "USE";
		inventory_selected_item_but_use_caption.vAlign = "top";
		inventory_selected_item_but_use_caption.hAlign = "center";
		inventory_selected_item_but_use_caption.positionY = 33;
		inventory_selected_item_but_use_caption.positionX = 14;
		inventory_selected_item_but_use_caption.isPointerBlocker = false;
		this.inventory_selected_item_but_use_caption = inventory_selected_item_but_use_caption;

		


		let inventory_selected_item_but_throw = new UIImage( inventory_selected_item_canvas, resources.textures.uiframesmall );
		inventory_selected_item_but_throw.vAlign = "bottom";
		inventory_selected_item_but_throw.hAlign = "left";
		inventory_selected_item_but_throw.sourceWidth = 64;
		inventory_selected_item_but_throw.sourceHeight = 64;
		inventory_selected_item_but_throw.width = 50;
		inventory_selected_item_but_throw.height = 20;
		inventory_selected_item_but_throw.positionX = 90;	
		inventory_selected_item_but_throw.positionY = 10;	
		inventory_selected_item_but_throw.onClick = new OnClick(() => {
			this.button_onclick( "selected_item_throw" );
		})
		this.inventory_selected_item_but_throw = inventory_selected_item_but_throw;


		let inventory_selected_item_but_throw_caption = new UIText( inventory_selected_item_but_throw );
		inventory_selected_item_but_throw_caption.value = "DROP";
		inventory_selected_item_but_throw_caption.vAlign = "top";
		inventory_selected_item_but_throw_caption.hAlign = "left";
		inventory_selected_item_but_throw_caption.positionY = 33;
		inventory_selected_item_but_throw_caption.positionX = 14;
		inventory_selected_item_but_throw_caption.isPointerBlocker = false;
		
		

		let inventory_selected_item_but_sell = new UIImage( inventory_selected_item_canvas, resources.textures.uiframesmall );
		inventory_selected_item_but_sell.vAlign = "bottom";
		inventory_selected_item_but_sell.hAlign = "left";
		inventory_selected_item_but_sell.sourceWidth = 64;
		inventory_selected_item_but_sell.sourceHeight = 64;
		inventory_selected_item_but_sell.width = 50;
		inventory_selected_item_but_sell.height = 20;
		inventory_selected_item_but_sell.positionX = 140;	
		inventory_selected_item_but_sell.positionY = 10;	
		inventory_selected_item_but_sell.visible = false;
		inventory_selected_item_but_sell.onClick = new OnClick(() => {
			this.button_onclick( "selected_item_sell" );
		})	
		this.inventory_selected_item_but_sell = inventory_selected_item_but_sell;


		let inventory_selected_item_but_sell_caption = new UIText( inventory_selected_item_but_sell );
		inventory_selected_item_but_sell_caption.value = "SELL";
		inventory_selected_item_but_sell_caption.vAlign = "top";
		inventory_selected_item_but_sell_caption.hAlign = "left";
		inventory_selected_item_but_sell_caption.positionY = 33;
		inventory_selected_item_but_sell_caption.positionX = 14;
		inventory_selected_item_but_sell_caption.isPointerBlocker = false;






		let inventory_selected_item_but_close = new UIImage( inventory_selected_item_canvas, resources.textures.uiframesmall );
		inventory_selected_item_but_close.vAlign = "top";
		inventory_selected_item_but_close.hAlign = "right";
		inventory_selected_item_but_close.sourceWidth = 64;
		inventory_selected_item_but_close.sourceHeight = 64;
		inventory_selected_item_but_close.width = 20;
		inventory_selected_item_but_close.height = 20;
		inventory_selected_item_but_close.positionX = 0;	
		inventory_selected_item_but_close.positionY = 0;	
		inventory_selected_item_but_close.onClick = new OnClick(() => {
			this.button_onclick( "selected_item_close" );
		})	


		let inventory_selected_item_but_close_caption = new UIText( inventory_selected_item_but_close );
		inventory_selected_item_but_close_caption.value = "X";
		inventory_selected_item_but_close_caption.vAlign = "top";
		inventory_selected_item_but_close_caption.hAlign = "left";
		inventory_selected_item_but_close_caption.positionY = 33;
		inventory_selected_item_but_close_caption.positionX = 5;
		inventory_selected_item_but_close_caption.isPointerBlocker = false;

		


		//-------------------------------------------------------------------------
		

		let player_stats_canvas = new UIImage( ui_2d_canvas , resources.textures.uiframe);
		player_stats_canvas.vAlign = "top";
		player_stats_canvas.hAlign = "right";
		player_stats_canvas.sourceWidth = 1024;
		player_stats_canvas.sourceHeight = 1024;
		player_stats_canvas.width = 200;
		player_stats_canvas.height = 260;
		player_stats_canvas.positionX = -10;	
		player_stats_canvas.positionY = 40;	
		

		let player_stats_caption = new UIText( player_stats_canvas );
		player_stats_caption.vAlign = "top";
		player_stats_caption.vTextAlign = "top";
		player_stats_caption.hAlign = "left";
		player_stats_caption.isPointerBlocker = false;
		player_stats_caption.positionY = -10;	
		player_stats_caption.positionX = 20;	
		this.player_stats_caption = player_stats_caption;

		

		let player_stats_btn_grp = new UIImage( player_stats_canvas , resources.textures.uiframe );
		player_stats_btn_grp.vAlign = "top";
		player_stats_btn_grp.hAlign = "right";
		player_stats_btn_grp.sourceWidth = 1024;
		player_stats_btn_grp.sourceHeight = 1024;
		player_stats_btn_grp.width = 0;
		player_stats_btn_grp.height = 0;
		player_stats_btn_grp.positionX = -40;
		player_stats_btn_grp.positionY = -85;
		this.player_stats_btn_grp = player_stats_btn_grp;


		let player_stats_btn_add_str = new UIImage( player_stats_btn_grp, resources.textures.uiframesmall );
		player_stats_btn_add_str.vAlign = "top";
		player_stats_btn_add_str.hAlign = "left";
		player_stats_btn_add_str.sourceWidth = 64;
		player_stats_btn_add_str.sourceHeight = 64;
		player_stats_btn_add_str.width = 24;
		player_stats_btn_add_str.height = 24;
		player_stats_btn_add_str.positionX = 0;	
		player_stats_btn_add_str.positionY = -4;	
		player_stats_btn_add_str.onClick = new OnClick(() => {
			this.button_onclick( "addstat_str" );
		})	

		let player_stats_btn_add_str_caption = new UIText( player_stats_btn_add_str );
		player_stats_btn_add_str_caption.value = "+";
		player_stats_btn_add_str_caption.vAlign = "top";
		player_stats_btn_add_str_caption.vTextAlign = "top";
		player_stats_btn_add_str_caption.hAlign = "left";
		player_stats_btn_add_str_caption.positionY = -5;
		player_stats_btn_add_str_caption.positionX = 8;
		player_stats_btn_add_str_caption.isPointerBlocker = false;


		let player_stats_btn_add_vit = new UIImage( player_stats_btn_grp, resources.textures.uiframesmall );
		player_stats_btn_add_vit.vAlign = "top";
		player_stats_btn_add_vit.hAlign = "left";
		player_stats_btn_add_vit.sourceWidth = 64;
		player_stats_btn_add_vit.sourceHeight = 64;
		player_stats_btn_add_vit.width = 24;
		player_stats_btn_add_vit.height = 24;
		player_stats_btn_add_vit.positionX = 0;	
		player_stats_btn_add_vit.positionY = -24;	
		player_stats_btn_add_vit.onClick = new OnClick(() => {
			this.button_onclick( "addstat_vit" );
		})	

		let player_stats_btn_add_vit_caption = new UIText( player_stats_btn_add_vit );
		player_stats_btn_add_vit_caption.value = "+";
		player_stats_btn_add_vit_caption.vAlign = "top";
		player_stats_btn_add_vit_caption.vTextAlign = "top";
		player_stats_btn_add_vit_caption.hAlign = "left";
		player_stats_btn_add_vit_caption.positionY = -5;
		player_stats_btn_add_vit_caption.positionX =  8;
		player_stats_btn_add_vit_caption.isPointerBlocker = false;





		let player_stats_btn_add_dex = new UIImage( player_stats_btn_grp, resources.textures.uiframesmall );
		player_stats_btn_add_dex.vAlign = "top";
		player_stats_btn_add_dex.hAlign = "left";
		player_stats_btn_add_dex.sourceWidth = 64;
		player_stats_btn_add_dex.sourceHeight = 64;
		player_stats_btn_add_dex.width = 24;
		player_stats_btn_add_dex.height = 24;
		player_stats_btn_add_dex.positionX = 0;	
		player_stats_btn_add_dex.positionY = -48;	
		player_stats_btn_add_dex.onClick = new OnClick(() => {
			this.button_onclick( "addstat_dex" );
		})	

		let player_stats_btn_add_dex_caption = new UIText( player_stats_btn_add_dex );
		player_stats_btn_add_dex_caption.value = "+";
		player_stats_btn_add_dex_caption.vAlign = "top";
		player_stats_btn_add_dex_caption.vTextAlign = "top";
		player_stats_btn_add_dex_caption.hAlign = "left";
		player_stats_btn_add_dex_caption.positionY = -5;
		player_stats_btn_add_dex_caption.positionX = 8;
		player_stats_btn_add_dex_caption.isPointerBlocker = false;





		let player_stats_btn_add_int = new UIImage( player_stats_btn_grp, resources.textures.uiframesmall );
		player_stats_btn_add_int.vAlign = "top";
		player_stats_btn_add_int.hAlign = "left";
		player_stats_btn_add_int.sourceWidth = 64;
		player_stats_btn_add_int.sourceHeight = 64;
		player_stats_btn_add_int.width = 24;
		player_stats_btn_add_int.height = 24;
		player_stats_btn_add_int.positionX = 0;	
		player_stats_btn_add_int.positionY = -72;	
		player_stats_btn_add_int.onClick = new OnClick(() => {
			this.button_onclick( "addstat_int" );
		})	

		let player_stats_btn_add_int_caption = new UIText( player_stats_btn_add_int );
		player_stats_btn_add_int_caption.value = "+";
		player_stats_btn_add_int_caption.vAlign = "top";
		player_stats_btn_add_int_caption.vTextAlign = "top";
		
		player_stats_btn_add_int_caption.hAlign = "left";
		player_stats_btn_add_int_caption.positionY = -5;
		player_stats_btn_add_int_caption.positionX = 8;
		player_stats_btn_add_int_caption.isPointerBlocker = false;


		











		//-------------------------------------------------------------------------
		
		//----
		let virpos_caption = new UIText( ui_2d_canvas );
		virpos_caption.value = "Virtual Coord: 0,0";
		virpos_caption.vAlign = "top";
		virpos_caption.hAlign = "left";
		virpos_caption.fontSize = 12;
		virpos_caption.positionY = -90;
		virpos_caption.positionX = 24;
		this.virpos_caption = virpos_caption;

		//-------------
		let shop_canvas = new UIImage( ui_2d_canvas , resources.textures.uiframe);
		shop_canvas.vAlign = "bottom";
		shop_canvas.hAlign = "right";
		shop_canvas.sourceWidth = 1024;
		shop_canvas.sourceHeight = 1024;
		shop_canvas.width = 220;
		shop_canvas.height = 420;
		shop_canvas.positionX = -280;	
		shop_canvas.positionY = -10;	
		shop_canvas.visible = false;
		this.shop_canvas = shop_canvas;
		

		let shop_but_close = new UIImage( shop_canvas, resources.textures.uiframesmall );
		shop_but_close.vAlign = "top";
		shop_but_close.hAlign = "right";
		shop_but_close.sourceWidth = 64;
		shop_but_close.sourceHeight = 64;
		shop_but_close.width = 20;
		shop_but_close.height = 20;
		shop_but_close.positionX = 0;	
		shop_but_close.positionY = 0;	
		shop_but_close.onClick = new OnClick(() => {
			this.button_onclick( "shop_close" );
		})	



		let shop_but_close_caption = new UIText( shop_but_close );
		shop_but_close_caption.value = "X";
		shop_but_close_caption.vAlign = "top";
		shop_but_close_caption.hAlign = "left";
		shop_but_close_caption.positionY = 33;
		shop_but_close_caption.positionX = 5;
		shop_but_close_caption.isPointerBlocker = false;	

		let shop_inventory = new UIImage(shop_canvas, resources.textures.inventory );
		shop_inventory.vAlign = "bottom";
		shop_inventory.hAlign = "right";
		shop_inventory.sourceWidth = 200;
		shop_inventory.sourceHeight = 160;
		shop_inventory.width = 200;
		shop_inventory.height = 160;
		shop_inventory.positionX = -10;
		shop_inventory.positionY = 10;

		let shop_caption = new UIText( shop_inventory );
		shop_caption.value = "Shop: Click on the item to select.\n"
		shop_caption.vTextAlign = "top";
		shop_caption.vAlign = "top";
		shop_caption.hAlign = "left";
		shop_caption.positionY = 20;	
		shop_caption.isPointerBlocker = false;


		for ( i = 0 ; i < 20 ; i++ ) {
			let item_image = new Txclickable_image( shop_inventory , resources.textures.emptyslot , this, i , "shop" );
			this.shop_inventories_uiimgs.push( item_image );
		}

		let shop_selected_slot_uiimg = new UIImage( shop_inventory , resources.textures.selectedslot );
		shop_selected_slot_uiimg.vAlign = "top";
		shop_selected_slot_uiimg.hAlign = "left";
		shop_selected_slot_uiimg.sourceWidth = 40;
		shop_selected_slot_uiimg.sourceHeight = 40;
		shop_selected_slot_uiimg.width = 40;
		shop_selected_slot_uiimg.height = 40;
		this.shop_selected_slot_uiimg = shop_selected_slot_uiimg;



		let shop_selected_item_canvas = new UIImage( shop_canvas , resources.textures.uiframe);
		shop_selected_item_canvas.vAlign = "bottom";
		shop_selected_item_canvas.hAlign = "right";
		shop_selected_item_canvas.sourceWidth = 1024;
		shop_selected_item_canvas.sourceHeight = 1024;
		shop_selected_item_canvas.width = 200;
		shop_selected_item_canvas.height = 180;
		shop_selected_item_canvas.positionX = -10;	
		shop_selected_item_canvas.positionY = 210;	
		this.shop_selected_item_canvas = shop_selected_item_canvas;
		


		let shop_selected_item_uiimg = new UIImage( shop_selected_item_canvas , resources.textures.emptyslot );
		shop_selected_item_uiimg.vAlign = "top";
		shop_selected_item_uiimg.hAlign = "left";
		shop_selected_item_uiimg.sourceWidth = 40;
		shop_selected_item_uiimg.sourceHeight = 40;
		shop_selected_item_uiimg.width = 40;
		shop_selected_item_uiimg.height = 40;
		shop_selected_item_uiimg.positionX = 4;	
		shop_selected_item_uiimg.positionY = -4;	
		this.shop_selected_item_uiimg = shop_selected_item_uiimg;
		
		let shop_selected_item_caption = new UIText( shop_selected_item_canvas );
		shop_selected_item_caption.vAlign = "top";
		shop_selected_item_caption.vTextAlign = "top";
		shop_selected_item_caption.hAlign = "left";
		shop_selected_item_caption.positionY = -10;	
		shop_selected_item_caption.positionX = 50;	

		this.shop_selected_item_caption = shop_selected_item_caption;
		


		let shop_selected_item_but_buy = new UIImage( shop_selected_item_canvas, resources.textures.uiframesmall );
		shop_selected_item_but_buy.vAlign = "bottom";
		shop_selected_item_but_buy.hAlign = "left";
		shop_selected_item_but_buy.sourceWidth = 64;
		shop_selected_item_but_buy.sourceHeight = 64;
		shop_selected_item_but_buy.width = 50;
		shop_selected_item_but_buy.height = 20;
		shop_selected_item_but_buy.positionX = 10;	
		shop_selected_item_but_buy.positionY = 10;	
		shop_selected_item_but_buy.onClick = new OnClick(() => {
			this.button_onclick( "shop_item_buy" );
		})

		let shop_selected_item_but_buy_caption = new UIText( shop_selected_item_but_buy );
		shop_selected_item_but_buy_caption.value = "BUY";
		shop_selected_item_but_buy_caption.vAlign = "top";
		shop_selected_item_but_buy_caption.hAlign = "left";
		shop_selected_item_but_buy_caption.positionY = 33;
		shop_selected_item_but_buy_caption.positionX = 14;
		shop_selected_item_but_buy_caption.isPointerBlocker = false;
		
		



	}	



		//---------------------------
	calculate_derived_stats() {

		let i , j ;
		for ( j = 2; j <= 9 ; j++ ) {

			let derived_points = 0;
			for ( i = 0 ; i < 6 ; i++ ) {
				if ( this.player_equipped[i] != null ) {
					derived_points += this.player_equipped[i][j];
				}
			}
			this.player_derived_stats[j] = derived_points;
		}

		// Maxhp
		this.player_derived_stats[10] = (( this.player_stats["vit"] +  this.player_derived_stats[5] ) * 5 )  + ( this.player_stats["level"] * 5 )  + this.player_derived_stats[8] ;
		
		// Maxmana				
		this.player_derived_stats[11] = (( this.player_stats["int"] +  this.player_derived_stats[7] ) * 5 )  + ( this.player_stats["level"] * 5 )  + this.player_derived_stats[9] ;
		
		// Damage 
		this.player_derived_stats[12] =  this.player_stats["str"] + this.player_derived_stats[3] ;


		// Pass info to playerb2d muserdata
		// curdamage
		this.stage.playerb2d.m_userData[7] = this.player_derived_stats[12];
			
		// maxhp
		this.stage.playerb2d.m_userData[9] = this.player_derived_stats[10];
		if ( this.stage.playerb2d.m_userData[8] == null || 
			 this.stage.playerb2d.m_userData[8] > this.player_derived_stats[10] ) {
			// curhp
			this.stage.playerb2d.m_userData[8] = this.player_derived_stats[10];
		}


		// maxmana 
		this.stage.playerb2d.m_userData[15] = this.player_derived_stats[11];
		if ( this.stage.playerb2d.m_userData[14] == null || 
			 this.stage.playerb2d.m_userData[14] > this.player_derived_stats[11] ) {
			// curmana
			this.stage.playerb2d.m_userData[14] = this.player_derived_stats[11];
		}				

	}	




	//----------
	// Draw to screen
	update_player_stats() {

		this.calculate_derived_stats();

		let healthbar_transform = this.stage.render_players[ 0 ]["healthbar"].getComponent(Transform);
		healthbar_transform.scale.x 	=   this.stage.playerb2d.m_userData[8] * 0.95 / this.stage.playerb2d.m_userData[9] ;
		healthbar_transform.position.x 	= ( this.stage.playerb2d.m_userData[9] - this.stage.playerb2d.m_userData[8]) * 0.95 / ( 2 * this.stage.playerb2d.m_userData[9] )
		
		
		this.player_stats_caption.value = "Player Stats:\n\n";

		this.player_stats_caption.value += "Level : "+ this.player_stats["level"] +"\n";
		this.player_stats_caption.value += "EXP : "+this.player_stats["exp"]+" / "+  this.exp_needed[ this.player_stats["level"] - 1 ] +"\n";



		this.player_stats_caption.value += "HP : "   + this.stage.playerb2d.m_userData[8].toFixed(0)   +  " / "  + this.player_derived_stats[10] + "\n";
		this.player_stats_caption.value += "Mana : " + this.stage.playerb2d.m_userData[14] +  " / "+ this.player_derived_stats[11] + "\n";

		this.player_stats_caption.value += "\n"
		
		
		this.player_stats_caption.value += "Strength : "  + this.player_stats["str"] 
		if ( this.player_derived_stats[4] > 0 ) {
			this.player_stats_caption.value +=  " (+" + this.player_derived_stats[4] + ")" 
		}
		this.player_stats_caption.value += "\n\n";


		this.player_stats_caption.value += "Vitality : "  + this.player_stats["vit"] 
		if ( this.player_derived_stats[5] > 0 ) {
			this.player_stats_caption.value +=  " (+" + this.player_derived_stats[5] + ")" 
		}
		this.player_stats_caption.value += "\n\n";

		this.player_stats_caption.value += "Dexterity : "  + this.player_stats["dex"] 
		if ( this.player_derived_stats[6] > 0 ) {
			this.player_stats_caption.value +=  " (+" + this.player_derived_stats[6] + ")" 
		}
		this.player_stats_caption.value += "\n\n";
		
		this.player_stats_caption.value += "Intelligence : "  + this.player_stats["int"] 
		if ( this.player_derived_stats[7] > 0 ) {
			this.player_stats_caption.value +=  " (+" + this.player_derived_stats[7] + ")" 
		}

		this.player_stats_caption.value += "\n\n";

		if ( this.player_stats["remaining_points"] > 0 ) {
			this.player_stats_btn_grp.visible = true;

		} else {
			this.player_stats_btn_grp.visible = false;

		}

		this.player_stats_caption.value += "Remaining Points: "+ this.player_stats["remaining_points"] +"\n"
		this.player_stats_caption.value += "Armor: "+ this.player_derived_stats[2] +"\n"
		this.player_stats_caption.value += "Damage: "+ this.player_derived_stats[12] +"\n"
		this.player_stats_caption.value += "Money: $ " + this.player_stats["money"] + "\n"
			

		

	}	


	//----
	update_inventory_2d_ui() {

		let i,j;

		// Unshow Unequippe
		for ( i = 0 ; i < 6 ; i++ ) {
			if ( this.player_equipped[j] == null ) {
				this.inventory_equipped_slot_uiimg[i].visible = false;
			}
		}


		for ( i = 0 ; i < this.inventories_uiimgs.length ; i++ ) {
			if ( i < this.inventories.length ) {
				
				let item  	  = this.inventories[i];
				let item_type = item[0];
				this.inventories_uiimgs[i].source = resources.textures[item_type];
				this.inventories_uiimgs[i].visible = true;

				for ( j = 0 ; j < 6; j++ ) {
					if ( this.player_equipped[j] == item ) {
						this.inventory_equipped_slot_uiimg[j].visible = true;
						this.inventory_equipped_slot_uiimg[j].positionX = this.inventories_uiimgs[i].positionX ;
						this.inventory_equipped_slot_uiimg[j].positionY = this.inventories_uiimgs[i].positionY ;
					} 
				}


			} else { 
				this.inventories_uiimgs[i].visible = false;
			}
		}
		
	}


	


	update() {
		
		let halfx = this.stage.tilesize / 2 ;
		let halfz = halfx;
		if ( this.stage.playerb2d.GetPosition().x < 0 ) {
			halfx = -halfx;
		}
		if ( this.stage.playerb2d.GetPosition().y < 0 ) {
			halfz = -halfz;
		}	
		let player_tile_x = ( (this.stage.playerb2d.GetPosition().x + halfx) / this.stage.tilesize ) >> 0 ;
		let player_tile_z = ( (this.stage.playerb2d.GetPosition().y + halfz) / this.stage.tilesize ) >> 0 ;
			
		this.virpos_caption.value = player_tile_x + ","  + player_tile_z  ;

		this.tick += 1 ;

	}










	//---------
	update_selected_item_ui() {


		if ( this.inventory_selected_slot >= 0 ) {
			
			this.inventory_selected_slot_uiimg.visible = true;
				
			this.inventory_selected_item_canvas.visible = true;
			this.inventory_selected_item_uiimg.source = this.inventories_uiimgs[ this.inventory_selected_slot ].source;


			let desc = "";
			let item = this.inventories[this.inventory_selected_slot];
			desc = this.get_item_description( item , "player");
			this.inventory_selected_item_caption.value = desc ;
		
			let item_type_parts = item[0].split("_");

					
			if ( item_type_parts[0] == "eqp" ) {
				
				let eqp_position = this.get_equipped_position( item_type_parts[2] );
				if ( this.player_equipped[ eqp_position ] == item ) {
					
					this.inventory_selected_item_but_use_caption.value = "UNEQUIP";


				} else {
					this.inventory_selected_item_but_use_caption.value = "EQUIP";
				}
			} else {
				this.inventory_selected_item_but_use_caption.value = "USE";
			}


		} else {
			this.inventory_selected_slot_uiimg.visible = false;
			this.inventory_selected_item_canvas.visible = false;

		}
		
	}

	//-------
	update_shop_2d_ui() {
		
		let i;
		if ( this.visiting_shop == 0 ) {
			this.shop_canvas.visible = false;
			this.inventory_selected_item_but_sell.visible = false;
			
		} else {
			
			for ( i = 0 ; i < this.shop_inventories_uiimgs.length ; i++ ) {

				if ( i < this.shop_inventories.length ) {
					
					let item_type = this.shop_inventories[i][0];
					this.shop_inventories_uiimgs[i].source = resources.textures[item_type];
					this.shop_inventories_uiimgs[i].visible = true;


				} else { 
					this.shop_inventories_uiimgs[i].visible = false;
				}
			}

			this.shop_canvas.visible = true;
			this.inventory_selected_item_but_sell.visible = true;

			// Shop selected item 
			if ( this.shop_selected_slot >= 0 ) {
			
				this.shop_selected_item_canvas.visible = true;
				this.shop_selected_item_uiimg.source = this.shop_inventories_uiimgs[ this.shop_selected_slot ].source;

				let desc = "";
				let item = this.shop_inventories[this.shop_selected_slot];
				desc = this.get_item_description( item , "shop");

				this.shop_selected_item_caption.value = desc ;
				

			} else {
				this.shop_selected_slot_uiimg.visible = false;
				this.shop_selected_item_canvas.visible = false;

			}

		}
	}

	//------
	capitalize(str) {
		return str.charAt(0).toUpperCase() + str.substr(1);
	}
	//----------
	get_item_description( item , owner ) {

		let desc = ""
		let item_type = item[0];
		let item_cost = item[1];
		let cost_lbl = "Cost";

		if ( owner == "player" ) {
			cost_lbl = "Can sell for";
			item_cost = (item[1] / 4 ) >> 0;
		}
		
		let item_type_parts = item_type.split("_");

		if ( item_type == "potion_health" ) {
					
			desc = "Health Potion:\n";
			desc += cost_lbl + ": $" + item_cost + "\n";
			desc += "Replenish 50 HP\n";
			
		} else if ( item_type_parts[0] == "eqp" ) {

			desc = this.capitalize( item_type_parts[1] ) + " " + this.capitalize( item_type_parts[2] ) + "\n";
			desc += cost_lbl + ": $" + item_cost + "\n";
			let j;
			for ( j = 2 ; j < 10 ; j++ ) {
				if ( item[j] != null && item[j] > 0 ) {
					let attr = this.get_attr_description(j);
					desc += attr + ": +" + item[j] + "\n";
				}
			}
		} else if ( item_type_parts[0] == "quest" ) {

			desc = this.capitalize( item_type_parts[1] ) + "\n";
			desc += "This is a quest item.\nNot for sale.\n";
			


		} else {
			desc = item_type
		}
		return desc;
	}

	public exp_needed = [
		500,
		1000,
		2250,
		4125,
		6300,
		8505,
		10206,
		11510,
		13319,
		14429,
		18036,
		22545,
		28181,
		35226,
		44033,
		55042,
		68801,
		86002,
		107503,
		134378,
		167973,
		209966,
		262457,
		328072,
		410090,
		512612,
		640765,
		698434,
		761293,
		829810,
		904492,
		985897,
		1074627,
		1171344,
		1276765,
		1391674,
		1516924,
		1653448,
		1802257,
		1964461,
		2141263,
		2333976,
		2544034,
		2772997,
		3022566,
		3294598,
		3591112,
		3914311,
		4266600,
		4650593,
		5069147,
		5525370,
		6022654,
		6564692,
		7155515,
		7799511,
		8501467,
		9266598,
		10100593,
		11009646,
		12000515,
		13080560,
		14257811,
		15541015,
		16939705,
		18464279,
		20126064,
		21937409,
		23911777,
		26063836,
		28409582,
		30966444,
		33753424,
		36791232,
		40102443,
		43711663,
		47645713,
		51933826,
		56607872,
		61702579,
		67255812,
		73308835,
		79906630,
		87098226,
		94937067,
		103481403,
		112794729,
		122946255,
		134011418,
		146072446,
		159218965,
		173548673,
		189168053,
		206193177,
		224750564,
		244978115,
		267026144,
		291058498
	];

}
