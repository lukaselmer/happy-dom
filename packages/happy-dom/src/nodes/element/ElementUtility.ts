import NodeTypeEnum from '../node/NodeTypeEnum.js';
import IElement from './IElement.js';
import INode from '../node/INode.js';
import HTMLCollection from './HTMLCollection.js';
import IDocument from '../document/IDocument.js';
import IDocumentFragment from '../document-fragment/IDocumentFragment.js';
import IHTMLElement from '../html-element/IHTMLElement.js';
import Element from './Element.js';
import NodeUtility from '../node/NodeUtility.js';
import DOMException from '../../exception/DOMException.js';
import DOMExceptionNameEnum from '../../exception/DOMExceptionNameEnum.js';

const NAMED_ITEM_ATTRIBUTES = ['id', 'name'];

/**
 * Element utility.
 */
export default class ElementUtility {
	/**
	 * Handles appending a child element to the "children" property.
	 *
	 * @param ancestorNode Ancestor node.
	 * @param node Node to append.
	 * @param [options] Options.
	 * @param [options.disableAncestorValidation] Disables validation for checking if the node is an ancestor of the ancestorNode.
	 * @returns Appended node.
	 */
	public static appendChild(
		ancestorNode: IElement | IDocument | IDocumentFragment,
		node: INode,
		options?: { disableAncestorValidation?: boolean }
	): INode {
		if (node.nodeType === NodeTypeEnum.elementNode && node !== ancestorNode) {
			if (
				!options?.disableAncestorValidation &&
				NodeUtility.isInclusiveAncestor(node, ancestorNode)
			) {
				throw new DOMException(
					"Failed to execute 'appendChild' on 'Node': The new node is a parent of the node to insert to.",
					DOMExceptionNameEnum.domException
				);
			}

			if (node.parentNode && (<IHTMLElement>node.parentNode).children) {
				const index = (<IHTMLElement>node.parentNode).children.indexOf(<IHTMLElement>node);
				if (index !== -1) {
					for (const attributeName of NAMED_ITEM_ATTRIBUTES) {
						const attribute = (<Element>node).attributes.getNamedItem(attributeName);
						if (attribute) {
							(<HTMLCollection<IHTMLElement>>(<IElement>node.parentNode).children)._removeNamedItem(
								<IHTMLElement>node,
								attribute.value
							);
						}
					}
					(<IHTMLElement>node.parentNode).children.splice(index, 1);
				}
			}

			for (const attributeName of NAMED_ITEM_ATTRIBUTES) {
				const attribute = (<Element>node).attributes.getNamedItem(attributeName);
				if (attribute) {
					(<HTMLCollection<IHTMLElement>>ancestorNode.children)._appendNamedItem(
						<IHTMLElement>node,
						attribute.value
					);
				}
			}

			ancestorNode.children.push(<IElement>node);

			NodeUtility.appendChild(ancestorNode, node, { disableAncestorValidation: true });
		} else {
			NodeUtility.appendChild(ancestorNode, node, options);
		}

		return node;
	}

	/**
	 * Handles removing a child element from the "children" property.
	 *
	 * @param ancestorNode Ancestor node.
	 * @param node Node.
	 * @returns Removed node.
	 */
	public static removeChild(
		ancestorNode: IElement | IDocument | IDocumentFragment,
		node: INode
	): INode {
		if (node.nodeType === NodeTypeEnum.elementNode) {
			const index = ancestorNode.children.indexOf(<IElement>node);
			if (index !== -1) {
				for (const attributeName of NAMED_ITEM_ATTRIBUTES) {
					const attribute = (<Element>node).attributes.getNamedItem(attributeName);
					if (attribute) {
						(<HTMLCollection<IHTMLElement>>ancestorNode.children)._removeNamedItem(
							<IHTMLElement>node,
							attribute.value
						);
					}
				}
				ancestorNode.children.splice(index, 1);
			}
		}

		NodeUtility.removeChild(ancestorNode, node);

		return node;
	}

	/**
	 *
	 * Handles inserting a child element to the "children" property.
	 *
	 * @param ancestorNode Ancestor node.
	 * @param newNode Node to insert.
	 * @param referenceNode Node to insert before.
	 * @param [options] Options.
	 * @param [options.disableAncestorValidation] Disables validation for checking if the node is an ancestor of the ancestorNode.
	 * @returns Inserted node.
	 */
	public static insertBefore(
		ancestorNode: IElement | IDocument | IDocumentFragment,
		newNode: INode,
		referenceNode: INode | null,
		options?: { disableAncestorValidation?: boolean }
	): INode {
		// NodeUtility.insertBefore() will call appendChild() for the scenario where "referenceNode" is "null" or "undefined"
		if (newNode.nodeType === NodeTypeEnum.elementNode && referenceNode) {
			if (
				!options?.disableAncestorValidation &&
				NodeUtility.isInclusiveAncestor(newNode, ancestorNode)
			) {
				throw new DOMException(
					"Failed to execute 'insertBefore' on 'Node': The new node is a parent of the node to insert to.",
					DOMExceptionNameEnum.domException
				);
			}

			if (newNode.parentNode && (<IHTMLElement>newNode.parentNode).children) {
				const index = (<IHTMLElement>newNode.parentNode).children.indexOf(<IHTMLElement>newNode);
				if (index !== -1) {
					for (const attributeName of NAMED_ITEM_ATTRIBUTES) {
						const attribute = (<Element>newNode).attributes.getNamedItem(attributeName);
						if (attribute) {
							(<HTMLCollection<IHTMLElement>>(
								(<IElement>newNode.parentNode).children
							))._removeNamedItem(<IHTMLElement>newNode, attribute.value);
						}
					}

					(<IElement>newNode.parentNode).children.splice(index, 1);
				}
			}

			if (referenceNode.nodeType === NodeTypeEnum.elementNode) {
				const index = ancestorNode.children.indexOf(<IElement>referenceNode);
				if (index !== -1) {
					ancestorNode.children.splice(index, 0, <IElement>newNode);
				}
			} else {
				ancestorNode.children.length = 0;

				for (const node of ancestorNode.childNodes) {
					if (node === referenceNode) {
						ancestorNode.children.push(<IElement>newNode);
					}
					if (node.nodeType === NodeTypeEnum.elementNode) {
						ancestorNode.children.push(<IElement>node);
					}
				}
			}

			for (const attributeName of NAMED_ITEM_ATTRIBUTES) {
				const attribute = (<Element>newNode).attributes.getNamedItem(attributeName);
				if (attribute) {
					(<HTMLCollection<IHTMLElement>>ancestorNode.children)._appendNamedItem(
						<IHTMLElement>newNode,
						attribute.value
					);
				}
			}

			NodeUtility.insertBefore(ancestorNode, newNode, referenceNode, {
				disableAncestorValidation: true
			});
		} else {
			NodeUtility.insertBefore(ancestorNode, newNode, referenceNode, options);
		}

		return newNode;
	}
}
