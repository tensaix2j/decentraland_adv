



export class Txtile extends Entity {

	public ori_pos;

	//------------------------
	constructor( parent , x, y, z , tilemat, xsize, ysize, zsize , noCollision ) {

		super();
		this.setParent(parent);

		
		if ( noCollision == 1 ) {
			this.addComponent( new PlaneShape() );
			this.getComponent( PlaneShape ).withCollisions = false;
		} else {
			this.addComponent( new BoxShape() );
		}

		this.addComponent( new Transform( {
			position: new Vector3(x, y, z),
			scale:    new Vector3( xsize, ysize, zsize)
		}));

		if ( noCollision == 1 ) {
			this.getComponent( Transform ).rotation.eulerAngles = new Vector3(90,0,0);
		}
		this.addComponent( tilemat );
		this.ori_pos = new Vector3( x, 0 , z );

	}
}