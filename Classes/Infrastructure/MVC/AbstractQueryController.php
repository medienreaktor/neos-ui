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

namespace Neos\Neos\Ui\Infrastructure\MVC;

use Neos\Flow\Annotations as Flow;
use Neos\Flow\Mvc\ActionRequest;
use Neos\Flow\Mvc\Controller\ActionController;
use Neos\Flow\Utility\Environment;
use Psr\Http\Message\ResponseInterface;

/**
 * FIXME it would be pretty if this controller would only implement the ControllerInterface -> but for that Flow would need to learn endpoints where [at]action does not matter.
 * We only extend the ActionController to use Flow\Route which is limited to that.
 *
 * @internal only to be used inside the Neos Ui package
 */
abstract class AbstractQueryController extends ActionController
{
    /**
     * @Flow\Inject
     * @var Environment
     */
    protected $environment;

    public function processRequest(ActionRequest $request): ResponseInterface
    {
        $this->request = $request;
        try {
            return $this->{$request->getControllerActionName() . 'Action'}();
        } catch (\InvalidArgumentException $e) {
            return QueryResponseHelper::createServerSideErrorForBadRequest($e);
        } catch (\Exception $e) {
            return QueryResponseHelper::createServerSideError($e, $this->environment->getContext()->isDevelopment());
        }
    }
}
