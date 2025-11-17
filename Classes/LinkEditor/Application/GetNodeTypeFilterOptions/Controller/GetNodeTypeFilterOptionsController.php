<?php

/*
 * This file is part of the Neos.Neos.Ui package.
 *
 * (c) Contributors of the Neos Project - www.neos.io
 *
 * This package is Open Source Software. For the full copyright and license
 * information, please view the LICENSE file which was distributed with this
 * source code.
 */

declare(strict_types=1);

namespace Neos\Neos\Ui\LinkEditor\Application\GetNodeTypeFilterOptions\Controller;

use Neos\Flow\Annotations as Flow;
use Neos\Neos\FrontendRouting\SiteDetection\SiteDetectionResult;
use Neos\Neos\Ui\Infrastructure\MVC\AbstractQueryController;
use Neos\Neos\Ui\Infrastructure\MVC\QueryResponseHelper;
use Neos\Neos\Ui\LinkEditor\Application\GetNodeTypeFilterOptions\GetNodeTypeFilterOptionsQuery;
use Neos\Neos\Ui\LinkEditor\Application\GetNodeTypeFilterOptions\GetNodeTypeFilterOptionsQueryHandler;
use Psr\Http\Message\ResponseInterface;

#[Flow\Scope("singleton")]
final class GetNodeTypeFilterOptionsController extends AbstractQueryController
{
    #[Flow\Inject]
    protected GetNodeTypeFilterOptionsQueryHandler $queryHandler;

    #[Flow\Route('neos/link-editor/get-node-type-filter-options')]
    public function processQueryAction(): ResponseInterface
    {
        $arguments = $this->request->getArguments();
        if (!isset($arguments['contentRepositoryId'])) {
            /** @todo send from UI */
            $siteDetectionResult = SiteDetectionResult::fromRequest($this->request->getHttpRequest());
            $arguments['contentRepositoryId'] = $siteDetectionResult->contentRepositoryId->value;
        }

        $query = GetNodeTypeFilterOptionsQuery::fromArray($arguments);
        $queryResult = $this->queryHandler->handle($query);

        return QueryResponseHelper::createSuccess($queryResult);
    }
}
