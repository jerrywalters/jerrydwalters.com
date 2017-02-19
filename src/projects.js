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
			'github.com/jerrywalters',
			'admin.jerrydwalters.com'
		],
		description: 'Hey hey hey there, Milord! I am writing a description of small to medium length, as I think this will be the average for most projects. How does it look?',
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
		backgroundColor: '#ffd8e6'
	}
]