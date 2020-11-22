



import { getUserData }	from "@decentraland/Identity";
import resources     from "src/resources";
import { UpdateSystem } from "src/updatesystem";
import { Txstage }      from "src/txstage";



export type EmitArg = {
	userID: string,
};


//----------------------------
export class MainClass {

	public messageBus;
	public userID;
	public stages = [];

	constructor() {

		var _this = this;
		let userData = executeTask(async () => {
			
            let data = await getUserData()
			log(data.displayName)
			let userID = data.displayName
			_this.start( userID );
		});
	}


	//---------------------
	public start( userID ) {

		let _this = this;
		this.userID = userID;
		
		log( Date(), "start", userID );
		
		// hide avatar
		const hideAvatarsEntity = new Entity()
		hideAvatarsEntity.addComponent(
			new AvatarModifierArea(
				{ 
					area: { 
						box: new Vector3(16, 4, 16) 
					}, 
					modifiers: [AvatarModifiers.HIDE_AVATARS] 
				}
			)
		);
		hideAvatarsEntity.addComponent(
			new Transform(
				{ 
					position: new Vector3(8, 0, 8) 
				}
			)
		);
		engine.addEntity(hideAvatarsEntity)



		const camera = Camera.instance;
        let stage = new Txstage( 
            "stage", 
            userID , 
            {
				position: new Vector3( 8, 0, 8),
				scale   : new Vector3( 1, 1, 1 )
		    }, 
            camera 
        );

        this.stages.push( stage );
		
		// Add system to engine
		engine.addSystem(new UpdateSystem( this.stages , camera ))

		
	} 

}


new MainClass();



