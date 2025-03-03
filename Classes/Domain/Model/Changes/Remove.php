<?php
declare(strict_types=1);
namespace Neos\Neos\Ui\Domain\Model\Changes;

/*
 * This file is part of the Neos.Neos.Ui package.
 *
 * (c) Contributors of the Neos Project - www.neos.io
 *
 * This package is Open Source Software. For the full copyright and license
 * information, please view the LICENSE file which was distributed with this
 * source code.
 */

use Neos\ContentRepository\Core\DimensionSpace\Exception\DimensionSpacePointNotFound;
use Neos\ContentRepository\Core\Feature\SubtreeTagging\Command\TagSubtree;
use Neos\ContentRepository\Core\Feature\SubtreeTagging\Dto\SubtreeTag;
use Neos\ContentRepository\Core\SharedModel\Exception\ContentStreamDoesNotExistYet;
use Neos\ContentRepository\Core\SharedModel\Node\NodeVariantSelectionStrategy;
use Neos\Neos\Ui\Domain\Model\AbstractChange;
use Neos\Neos\Ui\Domain\Model\Feedback\Operations\RemoveNode;
use Neos\Neos\Ui\Domain\Model\Feedback\Operations\UpdateNodeInfo;

/**
 * Removes a node
 * @internal These objects internally reflect possible operations made by the Neos.Ui.
 *           They are sorely an implementation detail. You should not use them!
 *           Please look into the php command API of the Neos CR instead.
 */
class Remove extends AbstractChange
{
    /**
     * Checks whether this change can be applied to the subject
     *
     * @return boolean
     */
    public function canApply(): bool
    {
        return true;
    }

    /**
     * Applies this change
     *
     * @throws ContentStreamDoesNotExistYet
     * @throws DimensionSpacePointNotFound
     */
    public function apply(): void
    {
        $subject = $this->subject;
        if ($this->canApply()) {
            $parentNode = $this->findParentNode($subject);
            if (is_null($parentNode)) {
                throw new \InvalidArgumentException(
                    'Cannot apply Remove without a parent on node ' . $subject->aggregateId->value,
                    1645560717
                );
            }

            // we have to schedule and the update workspace info before we actually delete the node;
            // otherwise we cannot find the parent nodes anymore.
            $this->updateWorkspaceInfo();

            // Issuing 'real' removals via 'RemoveNodeAggregate' on a non-live workspace are not desired in Neos
            // as these changes are not correctly publishable via the neos ui and may cause conflicts during rebase.
            // Instead, we must use tagging to soft-remove nodes.
            $command = TagSubtree::create(
                $subject->workspaceName,
                $subject->aggregateId,
                $subject->dimensionSpacePoint,
                NodeVariantSelectionStrategy::STRATEGY_ALL_SPECIALIZATIONS,
                SubtreeTag::removed()
            );

            $contentRepository = $this->contentRepositoryRegistry->get($subject->contentRepositoryId);
            $contentRepository->handle($command);

            $removeNode = new RemoveNode($subject, $parentNode);
            $this->feedbackCollection->add($removeNode);

            $updateParentNodeInfo = new UpdateNodeInfo();
            $updateParentNodeInfo->setNode($parentNode);

            $this->feedbackCollection->add($updateParentNodeInfo);
        }
    }
}
