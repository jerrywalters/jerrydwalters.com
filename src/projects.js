// portfolio-	admin images
import dickPic from './images/dickpic.png';
import admin from './images/admin.png';
import blueberry from './images/blueberry-red.png';
import lemon from './images/lemon-purple.png';
import peach from './images/peach-blue.png'

// portfolio-client images

export const projects = [
	{
		name: 'portfolio-admin',
		links: [
			'http://github.com/jerrywalters',
			'http://admin.jerrydwalters.com'
		],
		description: 'This project was built to allow me to chat with users and easily move between all of the different conversations on jerrydwalters.com. It uses react and redux to manage state, firebase as a realtime database, and various custom scripts -- such as a random name generator -- to give each visitor a unique identity.',
		technology: [
			{
				name: 'React',
				link: 'https://facebook.github.io/react/'
			},
			{
				name: 'Redux',
				link: 'http://redux.js.org/'
			},
			{
				name: 'Firebase',
				link: 'https://firebase.google.com/'
			},
		],
		images: [ dickPic, admin, blueberry, lemon, peach ],
		backgroundColor: '#ffc6cc'
	},
	{
		name: 'resume',
		links: [
			'http://github.com/jerrywalters',
			'http://admin.jerrydwalters.com'
		],
		description: 'This project was built to allow me to chat with users and easily move between all of the different conversations on jerrydwalters.com. It uses react and redux to manage state, firebase as a realtime database, and various custom scripts -- such as a random name generator -- to give each visitor a unique identity.',
		technology: [
			{
				name: 'React',
				link: 'https://facebook.github.io/react/'
			},
			{
				name: 'Redux',
				link: 'http://redux.js.org/'
			},
			{
				name: 'Firebase',
				link: 'https://firebase.google.com/'
			},
		],
		images: [ dickPic, admin, blueberry, lemon, peach ],
		backgroundColor: '#dadada'
	},
	{
		name: 'capital-one',
		links: [
			'http://github.com/jerrywalters',
			'http://admin.jerrydwalters.com'
		],
		description: 'This project was built to allow me to chat with users and easily move between all of the different conversations on jerrydwalters.com. It uses react and redux to manage state, firebase as a realtime database, and various custom scripts -- such as a random name generator -- to give each visitor a unique identity.',
		technology: [
			{
				name: 'React',
				link: 'https://facebook.github.io/react/'
			},
			{
				name: 'Redux',
				link: 'http://redux.js.org/'
			},
			{
				name: 'Firebase',
				link: 'https://firebase.google.com/'
			},
		],
		images: [ dickPic, admin, blueberry, lemon, peach ],
		backgroundColor: '#b3ffd9'
	},
	{
		name: 'portfolio-client',
		links: [
			'http://github.com/jerrywalters',
			'http://www.jerrydwalters.com'
		],
		description: 'This is the site you\'re on right now! Three.js is used to create a 3D scene to render objects like the cowardly dog you clicked to view this project. Once again, state is handled with React and Redux, and firebase is the realtime database for the chat app.',
		description2: 'Did I mention the chat app is built completely from scratch? Send me a drawing! The subtle background animation is also built from scratch with vanilla JavaScript and CSS animations.',
		technology: [
			{
				name: 'Three.js',
				link: 'https://threejs.org/'
			},
			{
				name: 'React',
				link: 'https://facebook.github.io/react/'
			},
			{
				name: 'Redux',
				link: 'http://redux.js.org/'
			},
			{
				name: 'Firebase',
				link: 'https://firebase.google.com/'
			},
		],
		images: [ dickPic, admin, blueberry, lemon, peach ],
		backgroundColor: '#a8d7ff'
	}
]