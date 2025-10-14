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

namespace Neos\Neos\Ui\Infrastructure\Configuration;

use Neos\ContentRepository\Core\ContentRepository;
use Neos\Flow\Annotations as Flow;
use Neos\Flow\Configuration\ConfigurationManager;
use Neos\Flow\Mvc\Routing\UriBuilder;
use Neos\Neos\Ui\Domain\InitialData\ConfigurationProviderInterface;
use Neos\Utility\PositionalArraySorter;

/**
 * @internal
 */
#[Flow\Scope("singleton")]
final class ConfigurationProvider implements ConfigurationProviderInterface
{
    #[Flow\Inject]
    protected ConfigurationManager $configurationManager;

    public function getConfiguration(
        ContentRepository $contentRepository,
        UriBuilder $uriBuilder,
    ): array {
        return [
            'nodeTree' => $this->configurationManager->getConfiguration(
                ConfigurationManager::CONFIGURATION_TYPE_SETTINGS,
                'Neos.Neos.userInterface.navigateComponent.nodeTree',
            ),
            'structureTree' => $this->configurationManager->getConfiguration(
                ConfigurationManager::CONFIGURATION_TYPE_SETTINGS,
                'Neos.Neos.userInterface.navigateComponent.structureTree',
            ),
            'editPreviewModes' => (new PositionalArraySorter(
                $this->configurationManager->getConfiguration(
                    ConfigurationManager::CONFIGURATION_TYPE_SETTINGS,
                    'Neos.Neos.userInterface.editPreviewModes',
                )
            ))->toArray()
        ];
    }
}
