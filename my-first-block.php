<?php
/**
 * Plugin Name:       My First Block
 * Description:       My first ever block for Gutenburg
 * Requires at least: 6.1
 * Requires PHP:      7.0
 * Version:           0.1.0
 * Author:            The WordPress Contributors
 * License:           GPL-2.0-or-later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:       my-first-block
 *
 * @package           my-block
 */
//namespace MyFirstBlock;
if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Registers the block using the metadata loaded from the `block.json` file.
 * Behind the scenes, it registers also all assets so they can be enqueued
 * through the block editor in the corresponding context.
 *
 * @see https://developer.wordpress.org/reference/functions/register_block_type/
 */
function my_first_block_my_first_block_block_init() {
	register_block_type( __DIR__ . '/build/my-first-block', array(
		'render_callback' => 'block_text_render'
	) );
	register_block_type( __DIR__ . '/build/my-second-block' );
	
}
add_action( 'init', 'my_first_block_my_first_block_block_init' );

function block_text_render($attributes, $content, $block_instance){

	$username = isset( $attributes['username'] ) ? $attributes['username'] : false;
	$count = isset( $attributes['count'] ) ? $attributes['count'] : false;

	if( ! $username ){
		return;
	}

	$cache_key = 'gutenberg_commits_' . $username . '_' . $count;
	$gb_data = get_transient($cache_key);

	if( false == $gb_data ){
		$url = add_query_arg( array(
			'author' => $username,
			'per_page' => $count
		), 'https://api.github.com/repos/WordPress/gutenberg/commits' );
	

		$gb_response = wp_remote_get($url);
		if( is_wp_error($gb_response) ){
			return 'Error: ' . $gb_response->get_error_message();
		}else{
			$gb_data = wp_remote_retrieve_body($gb_response);
		}

		set_transient($cache_key, $gb_data, 12 * HOUR_IN_SECONDS);
	}
	
	$gb_data = json_decode($gb_data);
	ob_start();
	?>
	<section <?php echo get_block_wrapper_attributes(); ?>>
		<h3><?php echo esc_html( $attributes['title'] ); ?></h3>
		<p><?php echo "Contributor: " . esc_html( $attributes['username'] ); ?></p>
		<ul>
			<?php 
			if(is_array($gb_data) && count($gb_data) > 0):
				$gb_data = array_slice($gb_data, 0, $attributes['count']);
				foreach($gb_data as $commit): 
					$message = (string) $commit->commit->message;
					$url = (string) $commit->html_url;
					preg_match('/(#[0-9]*)/', $message, $matches);
					?>
					<li>
						<a href="<?php echo esc_url( $url ); ?>" target="_blank" rel="noopener noreferrer">
							[<?php echo esc_html( $matches[0] ); ?>]
						</a>
					</li>
			<?php endforeach; ?>
			<?php else: ?>
				<li>No commits found</li>
			<?php endif; ?>
		</ul>
		<?php
		$all_commits_url = add_query_arg( array(
			'author' => esc_attr( $username ),
		), 
		'https://github.com/WordPress/gutenberg/commits'
		);
		?>
		<a href="<?php echo $all_commits_url; ?>" target="_blank" rel="noopener noreferrer">
			View all Props
		</a>
	</section>
	<?php
	$content = ob_get_clean();
	return $content;
}