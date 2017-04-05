// admin images
import admin1 from './images/admin-1.png';
import admin2 from './images/admin-2.png';
import admin3 from './images/admin-3.png';
import adminShapes from './images/admin-shapes.png';
import adminClose from './images/admin-close.png'

// portfolio images
import portfolio1 from './images/portfolio-1.png';
import portfolio2 from './images/portfolio-2.png';
import portfolio3 from './images/portfolio-3.png';
import portfolio4 from './images/portfolio-4.png';
import portfolio5 from './images/portfolio-5.png';
import portfolio6 from './images/portfolio-6.png';

// cap1 images
import cap1 from './images/cap-1.png';
import cap2 from './images/cap-2.png';
import cap3 from './images/cap-3.png';
import cap4 from './images/cap-4.png';
import cap5 from './images/cap-5.png';


export const projects = [
	{
		name: 'portfolio-admin',
		links: [
			'https://github.com/jerrywalters/admin.jerrydwalters.com',
			'http://admin.jerrydwalters.com/'
		],
		description: 'This project was built to allow me to chat with you and other users on jerrydwalters.com. It uses react with redux to manage state, firebase as a realtime database, and various custom scripts -- such as a random name and background generator -- to give each visitor a unique identity.',
		description2: 'I\'m also proud to say that I designed this app myself (especially excited about the icons and background!)',
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
		images: [ adminShapes, admin1, admin2, admin3, adminClose ],
		backgroundColor: '#ffc6cc'
	},
	// {
	// 	name: 'resume',
	// 	links: [
	// 		'http://admin.jerrydwalters.com',
	// 		'https://github.com/jerrywalters/admin.jerrydwalters.com'
	// 	],
	// 	description: 'This project was built to allow me to chat with users and easily move between all of the different conversations on jerrydwalters.com. It uses react and redux to manage state, firebase as a realtime database, and various custom scripts -- such as a random name generator -- to give each visitor a unique identity.',
	// 	technology: [
	// 		{
	// 			name: 'React',
	// 			link: 'https://facebook.github.io/react/'
	// 		},
	// 		{
	// 			name: 'Redux',
	// 			link: 'http://redux.js.org/'
	// 		},
	// 		{
	// 			name: 'Firebase',
	// 			link: 'https://firebase.google.com/'
	// 		},
	// 	],
	// 	images: [ dickPic, admin, blueberry, lemon, peach ],
	// 	backgroundColor: '#dadada'
	// },
	{
		name: 'capital-one',
		links: [
			'http://developer.capitalone.com',
		],
		description: 'I am a Front End Developer at Capital One working on our API Platform, DevExchange. A lot of the work I do for Capital One is UX Development on the design team. I take ideas for new features, and sometimes new products, build them out with the technology that I think is best suited for the job, and test them with our users.',
		description2: 'That most frequently means that I do UX design, and then build apps using HTML, CSS, and JavaScript. For most projects I use React, and i\'m currently working with D3 and Three.js.',
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
				name: 'D3',
				link: 'https://d3js.org/'
			},
			{
				name: 'Three.js',
				link: 'https://threejs.org/'
			},
			{
				name: 'Node.js',
				link: 'https://nodejs.org/en/'
			}
		],
		images: [ cap1, cap2, cap3, cap4, cap5],
		backgroundColor: '#b3ffd9'
	},
	{
		name: 'portfolio-client',
		links: [
			'https://github.com/jerrywalters/jerrydwalters.com',
			'http://www.jerrydwalters.com/'
		],
		description: 'This is the site you\'re on right now! Three.js is used to create a 3D scene and render objects like the sculpture you clicked to view this project. The site is built with React and uses Redux to manage state. Firebase is the realtime database for the chat app.',
		description2: 'Did I mention that chat app is built completely from scratch? Try sending me a drawing! The shapes you see floating around in the background are randomly placed, sized, and animated using vanilla JS -- I drew them up myself in Sketch.',
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
		images: [ portfolio1, portfolio2, portfolio5, portfolio3, portfolio6, portfolio4 ],
		backgroundColor: '#a8d7ff'
	}
]