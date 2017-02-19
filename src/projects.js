// portfolio admin pics
import dickPic from './images/dickpic.png';
import admin from './images/admin.png';
import blueberry from './images/blueberry-red.png';
import lemon from './images/lemon-purple.png';
import peach from './images/peach-blue.png'

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
		images: [
				dickPic, admin, blueberry, lemon, peach
		],
		backgroundColor: '#ffc6cc'
	}
]