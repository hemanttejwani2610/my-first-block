/**
 * Retrieves the translation of text.
 *
 * @see https://developer.wordpress.org/block-editor/reference-guides/packages/packages-i18n/
 */
import { __ } from '@wordpress/i18n';

/**
 * React hook that is used to mark the block wrapper element.
 * It provides all the necessary props like the class name.
 *
 * @see https://developer.wordpress.org/block-editor/reference-guides/packages/packages-block-editor/#useblockprops
 */
import { useBlockProps, RichText, InspectorControls } from '@wordpress/block-editor';
import { PanelBody, TextControl, RangeControl } from '@wordpress/components';
import { useEffect, useState } from '@wordpress/element';

import { useSelect } from '@wordpress/data';
import { store as coreDataStore } from '@wordpress/core-data';

/**
 * Lets webpack process CSS, SASS or SCSS files referenced in JavaScript files.
 * Those files can contain any CSS code that gets applied to the editor.
 *
 * @see https://www.npmjs.com/package/@wordpress/scripts#using-css
 */
import './editor.scss';

/**
 * The edit function describes the structure of your block in the context of the
 * editor. This represents what the editor will render when the block is used.
 *
 * @see https://developer.wordpress.org/block-editor/reference-guides/block-api/block-edit-save/#edit
 *
 * @return {Element} Element to render.
 */
export default function Edit({ attributes: { title, username, count }, setAttributes }) {
	console.log(useBlockProps());
	const classes = 'my-first-block';
	const url = `https://api.github.com/repos/WordPress/Gutenberg/commits?author=${username}&per_page=${count}`;
	const authorURL = `https://github.com/WordPress/gutenberg/commits?author=${username}`;
	/* const posts = useSelect((select) => 
		select(coreDataStore).getEntityRecords('postType', 'post', { per_page: 20 }),
		[]
	);

	console.log(posts); */
	const [props, setProps] = useState();
	const [propsToDisplay, setPropsToDisplay] = useState();

	useEffect(() => {
		const storageKey = `${username}_${count}`;
		console.log(storageKey)
		if(window.sessionStorage.getItem(storageKey)) {
			setProps(JSON.parse(window.sessionStorage.getItem(storageKey)));
			console.log('from storage');
		} else {
			window.sessionStorage.setItem(storageKey, 'This is a test');
			console.log('from fetch');
			fetch(`https://api.github.com/repos/WordPress/Gutenberg/commits?author=${username}&per_page=${count}`).
				then((response) => response.json()).
				then((data) => {
					setProps(data);
					window.sessionStorage
						.setItem(storageKey, JSON.stringify(data));
				});
			
		}
	}, [username, count]);

	useEffect(() => {
		if (props) {
			setPropsToDisplay(props.slice(0, count));
		}
	}, [props, count]);

	return (
		<section { ...useBlockProps() } className = { classes } >
			<RichText
				tagName="H2"
				value={title}
				onChange={(newTitle) => setAttributes({ title: newTitle })}
				allowedFormats={['core/bold', 'core/italic', 'core/link']}
			/>
			<RichText
				tagName="p"
				label={__('Username', 'my-first-block')}
				value={username}
				onChange={(newUsername) => setAttributes({ username: newUsername })}
			/>
			<RichText
				tagName="p"
				label={__('My Range Control', 'my-first-block')}
				value={count}
				onChange={(newCount) => setAttributes({ count: newCount })}
			/>
			{propsToDisplay ? (
				<ul>
					{propsToDisplay.map(({ sha, commit: { message } }) => {
						return (
							<li key={sha}>
								<a href="#">[#{message}]</a>
							</li>
						);
					})}
				</ul>
			) : (
					<p>Loading...</p>
			)}
			<a href={authorURL}>
				View all Props
			</a>
			<InspectorControls>
				<PanelBody title={__('My Panel', 'my-first-block')}>
					<TextControl
						label={__('My Text Control', 'my-first-block')}
						value={title}
						onChange={(newTitle) => setAttributes({ title: newTitle })}
					/>
					<TextControl
						label={__('Username', 'my-first-block')}
						value={username}
						onChange={(newUsername) => setAttributes({ username: newUsername })}
					/>
					<RangeControl 
						label={__('My Range Control', 'my-first-block')}
						value={count}
						onChange={(newCount) => setAttributes({ count: newCount })}
						min={0}	
						max={100}
					/>
				</PanelBody>
			</InspectorControls>
		</section>
	);
}
