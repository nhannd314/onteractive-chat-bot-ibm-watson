import * as THREE from './threejs/three.module.js';

import Stats from './threejs/stats.module.js';
import { GUI } from './threejs/dat.gui.module.js';

import { GLTFLoader } from './threejs/GLTFLoader.js';

import { OrbitControls } from './threejs/OrbitControls.js';

var container, stats, clock, gui, mixer, actions, activeAction, previousAction;
var camera, scene, renderer, model, face, controls;

var api = { state: 'Idle' };

init();
animate();

function init() {

	container = document.createElement( 'div' );
	document.body.appendChild( container );

	camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 0.25, 100 );
	camera.position.set( - 5, 3, 15 );
	camera.lookAt( new THREE.Vector3( 0, 2, 0 ) );

	scene = new THREE.Scene();
	scene.background = new THREE.Color( 0xe0e0e0 );
	scene.fog = new THREE.Fog( 0xe0e0e0, 20, 100 );

	clock = new THREE.Clock();

	// lights

	var light = new THREE.HemisphereLight( 0xffffff, 0x444444 );
	light.position.set( 0, 20, 0 );
	scene.add( light );

	light = new THREE.DirectionalLight( 0xffffff );
	light.position.set( 0, 20, 10 );
	scene.add( light );

	// ground

	var mesh = new THREE.Mesh( new THREE.PlaneBufferGeometry( 2000, 2000 ), new THREE.MeshPhongMaterial( { color: 0x999999, depthWrite: false } ) );
	mesh.rotation.x = - Math.PI / 2;
	scene.add( mesh );

	var grid = new THREE.GridHelper( 200, 40, 0x000000, 0x000000 );
	grid.material.opacity = 0.2;
	grid.material.transparent = true;
	scene.add( grid );

	// model

	var loader = new GLTFLoader();
	loader.load( './js/threejs/model/RobotExpressive.glb', function ( gltf ) {

		model = gltf.scene;
		scene.add( model );

		createGUI( model, gltf.animations );

	}, undefined, function ( e ) {

		console.error( e );

	} );

	renderer = new THREE.WebGLRenderer( { antialias: true } );
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setSize( window.innerWidth, window.innerHeight );
	renderer.gammaOutput = true;
	renderer.gammaFactor = 2.2;
	container.appendChild( renderer.domElement );

	window.addEventListener( 'resize', onWindowResize, false );

	// stats
	//stats = new Stats();
	//container.appendChild( stats.dom );

	// controls
	controls = new OrbitControls( camera, renderer.domElement );

}

function createGUI( model, animations ) {

	var states = [ 'Idle', 'Walking', 'Running', 'Dance', 'Death', 'Sitting', 'Standing' ];
	var emotes = [ 'Jump', 'Yes', 'No', 'Wave', 'Punch', 'ThumbsUp' ];

	gui = new GUI();

	mixer = new THREE.AnimationMixer( model );

	actions = {};

	for ( var i = 0; i < animations.length; i ++ ) {

		var clip = animations[ i ];
		var action = mixer.clipAction( clip );
		actions[ clip.name ] = action;

		if ( emotes.indexOf( clip.name ) >= 0 || states.indexOf( clip.name ) >= 4 ) {

			action.clampWhenFinished = true;
			action.loop = THREE.LoopOnce;

		}

	}

	// states

	var statesFolder = gui.addFolder( 'States' );

	var clipCtrl = statesFolder.add( api, 'state' ).options( states );

	// change state
	clipCtrl.onChange( function () {

		fadeToAction( api.state, 0.5 );

	} );

	statesFolder.open();

	// emotes
	var emoteFolder = gui.addFolder( 'Emotes' );

	function createEmoteCallback( name ) {

		api[ name ] = function () {

			fadeToAction( name, 0.2 );

			mixer.addEventListener( 'finished', restoreState );

		};

		emoteFolder.add( api, name );

	}

	function restoreState() {

		mixer.removeEventListener( 'finished', restoreState );

		fadeToAction( api.state, 0.2 );

	}

	for ( var i = 0; i < emotes.length; i ++ ) {

		createEmoteCallback( emotes[ i ] );

	}

	emoteFolder.open();

	// expressions

	face = model.getObjectByName( 'Head_2' );

	var expressions = Object.keys( face.morphTargetDictionary );
	var expressionFolder = gui.addFolder( 'Expressions' );

	for ( var i = 0; i < expressions.length; i ++ ) {

		expressionFolder.add( face.morphTargetInfluences, i, 0, 1, 0.01 ).name( expressions[ i ] );

	}

	activeAction = actions[ 'Idle' ];
	activeAction.play();

	expressionFolder.open();

}

function fadeToAction( name, duration ) {

	previousAction = activeAction;
	activeAction = actions[ name ];

	if ( previousAction !== activeAction ) {

		previousAction.fadeOut( duration );

	}

	activeAction
		.reset()
		.setEffectiveTimeScale( 1 )
		.setEffectiveWeight( 1 )
		.fadeIn( duration )
		.play();

}

function onWindowResize() {

	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

	renderer.setSize( window.innerWidth, window.innerHeight );

}

//

function animate() {

	var dt = clock.getDelta();

	if ( mixer ) mixer.update( dt );

	requestAnimationFrame( animate );

	renderer.render( scene, camera );

	//stats.update();

}

var states_arr = [ 'Idle', 'Walking', 'Running', 'Dance', 'Death', 'Sitting', 'Standing', 'Jump', 'Yes', 'No', 'Wave', 'Punch', 'ThumbsUp' ];

jQuery(document).ready(function($) {
	$('#chatForm').on('submit', function(e) {
		e.preventDefault()
		var text = $('#chatInput').val()
		var session = $('#chatSession').val()
		$('#chatInput').val('')

		// if session not set then message connecting ...
		if (session == '') {
			$('#chatNotify').css('opacity', 1)
		}

		// show chat text
		$('#conversationWrap').append('<p class="me">' + text + '</p>')
		$('#conversationWrap').scrollTop($('#conversationWrap')[0].scrollHeight)

		// ajax send to server
		$.post('doChat', {
			text: text,
			session: session
		}, function(response, status) {
			//console.log(response); return;
			$('#chatNotify').hide()
			if ($('#chatSession').val() == '' && response.session != '') {
				// set session
				$('#chatSession').val(response.session)
			}
			$('#conversationWrap').append('<p class="bot">' + response.text + '</p>')
			$('#conversationWrap').scrollTop($('#conversationWrap')[0].scrollHeight)

			// get action then animate
			if (response.text.includes('I will')) {
				var action = capitalize( last_word(response.text) )
				if (states_arr.includes(action))
					fadeToAction(action, 0.5)
			}
		})
	})
})

function last_word(words) {
	var n = words.split(" ");
	return n[n.length - 1];
}

function capitalize(s) {
	if (typeof s !== 'string') return ''
	return s.charAt(0).toUpperCase() + s.slice(1)
}